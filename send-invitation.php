<?php
/* =========================================================
   send-invitation.php  —  emails the (hidden) invitation link to the person who published it.
   Free: runs on Hostinger PHP, sends through your own mailbox (SMTP) or Brevo free SMTP.
   Settings live in mail-config.php (copy mail-config.sample.php -> mail-config.php).

   POST JSON  { "id": "<slug>", "email": "name@gmail.com", "idToken": "<firebase id token>" }
   Checks, in order:  method / origin  ->  email format  ->  rate limits  ->
                      Firebase token is valid  ->  the invitation exists AND belongs to that token's user  ->  send.
   The link is built here on the server, so it is never needed on the page.
   ========================================================= */

const FIREBASE_PROJECT = 'ad-soft-technologies';
const FIREBASE_API_KEY = 'AIzaSyC94YPBZNKKPIt22ociotCQbYnc2ZR6Lmw'; // public web key (same as js/inv-config.js)
const COLLECTION       = 'premiumInvitations';

/* ---------------- small helpers ---------------- */
function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function one_line($s) { return trim(preg_replace('/\s+/u', ' ', (string)$s)); }

function load_config() {
  $f = __DIR__ . '/mail-config.php';
  $cfg = is_file($f) ? (require $f) : [];
  return array_merge([
    'transport'       => 'smtp',                       // 'smtp' | 'mail'
    'host'            => 'smtp.hostinger.com',
    'port'            => 465,
    'secure'          => 'ssl',                        // 'ssl' (465) | 'tls' (587 STARTTLS) | 'none'
    'username'        => '',
    'password'        => '',
    'from_email'      => 'no-reply@adsofttechnologies.com',
    'from_name'       => 'AD Soft Technologies',
    'reply_to'        => '',
    'site_url'        => 'https://www.adsofttechnologies.com',
    'viewer_path'     => '/invitation',                // must match viewerUrl in js/inv-config.js
    'allowed_hosts'   => ['www.adsofttechnologies.com', 'adsofttechnologies.com'],
    'limit_ip_hour'   => 12,
    'limit_email_day' => 6,
    'limit_id_day'    => 10,
    'data_dir'        => __DIR__ . '/_mail_data',
  ], is_array($cfg) ? $cfg : []);
}

/* ---------------- tiny file-based rate limiter ---------------- */
function rate_hit($dir, $key, $max, $window) {
  if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    @file_put_contents($dir . '/index.html', '');
  }
  $f = $dir . '/rl_' . sha1($key) . '.json';
  $fh = @fopen($f, 'c+');
  if (!$fh) return true;                               // never block mail because of a storage problem
  flock($fh, LOCK_EX);
  $now = time();
  $hits = json_decode((string)stream_get_contents($fh), true);
  $hits = array_values(array_filter(is_array($hits) ? $hits : [], function ($t) use ($now, $window) { return $t > $now - $window; }));
  $ok = count($hits) < $max;
  if ($ok) $hits[] = $now;
  ftruncate($fh, 0); rewind($fh); fwrite($fh, json_encode($hits));
  flock($fh, LOCK_UN); fclose($fh);
  return $ok;
}

/* ---------------- Google / Firebase REST (injectable for tests) ---------------- */
function http_request($method, $url, $jsonBody = null) {
  $headers = ['Content-Type: application/json'];
  if (function_exists('curl_init')) {
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers]);
    if ($jsonBody !== null) curl_setopt($c, CURLOPT_POSTFIELDS, json_encode($jsonBody));
    $body = curl_exec($c); $code = (int)curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    return [$code, $body];
  }
  $ctx = stream_context_create(['http' => ['method' => $method, 'header' => implode("\r\n", $headers), 'content' => $jsonBody !== null ? json_encode($jsonBody) : '', 'timeout' => 8, 'ignore_errors' => true]]);
  $body = @file_get_contents($url, false, $ctx);
  $code = 0; if (!empty($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $code = (int)$m[1];
  return [$code, $body];
}
function decode_value($v) {
  if (isset($v['stringValue']))  return $v['stringValue'];
  if (isset($v['integerValue'])) return (int)$v['integerValue'];
  if (isset($v['doubleValue']))  return $v['doubleValue'];
  if (isset($v['booleanValue'])) return $v['booleanValue'];
  if (isset($v['mapValue']))     { $o = []; foreach (($v['mapValue']['fields'] ?? []) as $k => $x) $o[$k] = decode_value($x); return $o; }
  if (isset($v['arrayValue']))   return array_map('decode_value', $v['arrayValue']['values'] ?? []);
  return null;
}
/* uid of a Firebase ID token, or '' if the token is not valid */
function token_uid($idToken, $http) {
  [$code, $body] = $http('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . FIREBASE_API_KEY, ['idToken' => $idToken]);
  if ($code !== 200) return '';
  $j = json_decode((string)$body, true);
  return (string)($j['users'][0]['localId'] ?? '');
}
/* returns array (doc), null (not found) or false (lookup failed) */
function fetch_invitation($id, $http) {
  [$code, $body] = $http('GET', 'https://firestore.googleapis.com/v1/projects/' . FIREBASE_PROJECT . '/databases/(default)/documents/' . COLLECTION . '/' . rawurlencode($id) . '?key=' . FIREBASE_API_KEY, null);
  if ($code === 404) return null;
  if ($code !== 200) return false;
  $j = json_decode((string)$body, true); if (!is_array($j)) return false;
  $out = []; foreach (($j['fields'] ?? []) as $k => $x) $out[$k] = decode_value($x);
  return $out;
}

/* ---------------- e-mail body ---------------- */
function build_mail($title, $link) {
  $title = one_line($title) ?: 'Your digital invitation';
  $subject = 'Your invitation link: ' . $title;
  $text = "Your invitation is live!\n\n$title\n\nOpen / share your invitation link:\n$link\n\n"
        . "Send this link to your guests on WhatsApp, SMS or email. You can edit the invitation any time in the same browser - the link never changes.\n\n"
        . "- AD Soft Technologies\n";
  $html = '<!doctype html><html><body style="margin:0;padding:0;background:#f3f6f1;">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f1;padding:28px 12px;"><tr><td align="center">'
    . '<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#1f2a22;">'
    . '<tr><td style="background:#559643;padding:22px 28px;color:#fff;font-size:18px;font-weight:700;">AD Soft Technologies</td></tr>'
    . '<tr><td style="padding:28px;">'
    . '<h1 style="margin:0 0 8px;font-size:22px;">Your invitation is live &#127881;</h1>'
    . '<p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#4b574e;">' . esc($title) . '</p>'
    . '<p style="margin:0 0 22px;"><a href="' . esc($link) . '" style="display:inline-block;background:#559643;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:12px;">Open my invitation</a></p>'
    . '<p style="margin:0 0 6px;font-size:13px;color:#6b776e;">Or copy this link:</p>'
    . '<p style="margin:0 0 22px;font-size:14px;word-break:break-all;"><a href="' . esc($link) . '" style="color:#3f7a31;">' . esc($link) . '</a></p>'
    . '<p style="margin:0;font-size:13px;line-height:1.55;color:#6b776e;">Share it with your guests on WhatsApp, SMS or email. You can edit the invitation any time from the same browser &mdash; the link never changes.</p>'
    . '</td></tr></table>'
    . '<p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a958c;margin:16px 0 0;">You received this because this address was entered on adsofttechnologies.com to receive an invitation link.</p>'
    . '</td></tr></table></body></html>';
  return [$subject, $text, $html];
}

function mime_message($cfg, $to, $subject, $text, $html) {
  $b = 'b' . bin2hex(random_bytes(12));
  $fromName = '=?UTF-8?B?' . base64_encode($cfg['from_name']) . '?=';
  $domain = substr(strrchr($cfg['from_email'], '@'), 1) ?: 'localhost';
  $h = [
    'Date: ' . date('r'),
    'From: ' . $fromName . ' <' . $cfg['from_email'] . '>',
    'To: <' . $to . '>',
    'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
    'Message-ID: <' . bin2hex(random_bytes(10)) . '@' . $domain . '>',
    'MIME-Version: 1.0',
    'Auto-Submitted: auto-generated',
  ];
  if ($cfg['reply_to']) $h[] = 'Reply-To: <' . $cfg['reply_to'] . '>';
  $h[] = 'Content-Type: multipart/alternative; boundary="' . $b . '"';
  $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
        . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html))
        . "--$b--\r\n";
  return [$h, $body];
}

/* ---------------- sending ---------------- */
function smtp_expect($fp, $codes) {
  $resp = '';
  while (($line = fgets($fp, 1024)) !== false) { $resp .= $line; if (strlen($line) < 4 || $line[3] === ' ') break; }
  if (!in_array((int)substr($resp, 0, 3), (array)$codes, true)) throw new RuntimeException('SMTP: ' . trim($resp));
  return $resp;
}
function smtp_cmd($fp, $cmd, $codes) { fwrite($fp, $cmd . "\r\n"); return smtp_expect($fp, $codes); }

function send_via_smtp($cfg, $to, $subject, $text, $html) {
  $secure = $cfg['secure'];
  $remote = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $cfg['host'] . ':' . (int)$cfg['port'];
  $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true, 'peer_name' => $cfg['host']]]);
  $fp = @stream_socket_client($remote, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
  if (!$fp) throw new RuntimeException("SMTP connect failed: $errstr ($errno)");
  stream_set_timeout($fp, 15);
  try {
    smtp_expect($fp, 220);
    $ehlo = (preg_replace('/[^A-Za-z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost');
    smtp_cmd($fp, "EHLO $ehlo", 250);
    if ($secure === 'tls') {
      smtp_cmd($fp, 'STARTTLS', 220);
      if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('SMTP: STARTTLS failed');
      smtp_cmd($fp, "EHLO $ehlo", 250);
    }
    if ($cfg['username'] !== '') {
      smtp_cmd($fp, 'AUTH LOGIN', 334);
      smtp_cmd($fp, base64_encode($cfg['username']), 334);
      smtp_cmd($fp, base64_encode($cfg['password']), 235);
    }
    smtp_cmd($fp, 'MAIL FROM:<' . $cfg['from_email'] . '>', 250);
    smtp_cmd($fp, 'RCPT TO:<' . $to . '>', [250, 251]);
    smtp_cmd($fp, 'DATA', 354);
    [$headers, $body] = mime_message($cfg, $to, $subject, $text, $html);
    $data = implode("\r\n", $headers) . "\r\n\r\n" . $body;
    $data = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $data));   // dot-stuffing
    $data = str_replace("\n", "\r\n", $data);
    fwrite($fp, $data . "\r\n.\r\n");
    smtp_expect($fp, 250);
    @smtp_cmd($fp, 'QUIT', [221, 250]);
  } finally { fclose($fp); }
}
function send_via_mail($cfg, $to, $subject, $text, $html) {
  [$headers, $body] = mime_message($cfg, $to, $subject, $text, $html);
  $skip = ['To:', 'Subject:'];                         // mail() adds these itself
  $h = array_filter($headers, function ($l) use ($skip) { foreach ($skip as $s) if (stripos($l, $s) === 0) return false; return true; });
  if (!@mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $h), '-f' . $cfg['from_email'])) throw new RuntimeException('mail() failed');
}
function send_mail($cfg, $to, $subject, $text, $html) {
  if ($cfg['transport'] === 'mail') send_via_mail($cfg, $to, $subject, $text, $html);
  else send_via_smtp($cfg, $to, $subject, $text, $html);
}

/* ---------------- request handler (returns [httpStatus, array]) ---------------- */
function handle_request($cfg, $method, $origin, $ip, $body, $http, $sender = 'send_mail') {
  if ($method !== 'POST') return [405, ['ok' => false, 'error' => 'Method not allowed']];
  if ($origin !== '') {
    $oh = strtolower((string)parse_url($origin, PHP_URL_HOST));
    if (!in_array($oh, $cfg['allowed_hosts'], true)) return [403, ['ok' => false, 'error' => 'Not allowed']];
  }
  $id    = is_string($body['id'] ?? null) ? trim($body['id']) : '';
  $email = is_string($body['email'] ?? null) ? strtolower(trim($body['email'])) : '';
  $token = is_string($body['idToken'] ?? null) ? $body['idToken'] : '';
  if (!preg_match('/^[a-z0-9][a-z0-9-]{2,38}[a-z0-9]$/', $id)) return [400, ['ok' => false, 'error' => 'Invalid invitation.']];
  if (strlen($email) > 160 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n,;<>]/', $email)) return [400, ['ok' => false, 'error' => 'Please enter a valid email address.']];
  if ($token === '' || strlen($token) > 4096) return [401, ['ok' => false, 'error' => 'Please reload the page and try again.']];

  $dir = $cfg['data_dir'];
  if (!rate_hit($dir, 'ip:' . $ip, $cfg['limit_ip_hour'], 3600)
   || !rate_hit($dir, 'em:' . $email, $cfg['limit_email_day'], 86400)
   || !rate_hit($dir, 'id:' . $id, $cfg['limit_id_day'], 86400)) return [429, ['ok' => false, 'error' => 'Too many requests. Please try again later.']];

  $uid = token_uid($token, $http);
  if ($uid === '') return [401, ['ok' => false, 'error' => 'Session expired. Please reload the page and try again.']];
  $doc = fetch_invitation($id, $http);
  if ($doc === false) return [502, ['ok' => false, 'error' => 'Could not reach the server. Please try again.']];
  if ($doc === null || ($doc['ownerUid'] ?? '') !== $uid) return [403, ['ok' => false, 'error' => 'This invitation does not belong to this browser.']];

  $link = rtrim($cfg['site_url'], '/') . '/' . ltrim($cfg['viewer_path'], '/') . '?id=' . rawurlencode($id);
  [$subject, $text, $html] = build_mail((string)($doc['title'] ?? ''), $link);
  try { $sender($cfg, $email, $subject, $text, $html); }
  catch (Throwable $e) { error_log('send-invitation: ' . $e->getMessage()); return [500, ['ok' => false, 'error' => 'Email could not be sent right now. Please try again in a minute.']]; }
  return [200, ['ok' => true]];
}

/* ---------------- entry point (skipped when included by tests) ---------------- */
if (PHP_SAPI !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  header('X-Content-Type-Options: nosniff');
  $raw = file_get_contents('php://input', false, null, 0, 20000);
  $body = json_decode((string)$raw, true);
  [$status, $out] = handle_request(
    load_config(), $_SERVER['REQUEST_METHOD'] ?? 'GET', (string)($_SERVER['HTTP_ORIGIN'] ?? ''),
    (string)($_SERVER['REMOTE_ADDR'] ?? ''), is_array($body) ? $body : [], 'http_request');
  http_response_code($status);
  echo json_encode($out);
}
