<?php
/* =========================================================
   invitation.php  —  server-rendered Open Graph tags (Hostinger / any PHP host)
   .htaccess maps  /invitation?id=<slug>  ->  this file.
   It reads the invitation from Firestore (REST), builds a unique title / description / image
   and injects the <meta og:*> tags into the FIRST html response, so WhatsApp, Facebook, Telegram,
   LinkedIn, X ... can read them without running JavaScript. Visitors get the normal viewer page.
   ========================================================= */
const FIREBASE_PROJECT = 'ad-soft-technologies';
const FIREBASE_API_KEY = 'AIzaSyC94YPBZNKKPIt22ociotCQbYnc2ZR6Lmw'; // public web key (same as js/inv-config.js)
const COLLECTION       = 'premiumInvitations';
const SITE_NAME        = 'AD Soft Technologies';
const VIEWER_FILE      = __DIR__ . '/invitation-viewer.html';
const CACHE_SECONDS    = 120;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function one_line($s) { return trim(preg_replace('/\s+/u', ' ', (string)$s)); }
function clip($s, $n) {
  $s = one_line($s);
  if (mb_strlen($s) <= $n) return $s;
  $cut = mb_substr($s, 0, $n - 1);
  return preg_replace('/\s+\S*$/u', '', $cut) . '…';
}
function dig($a, $path) {
  foreach (explode('.', $path) as $k) { if (!is_array($a) || !array_key_exists($k, $a)) return null; $a = $a[$k]; }
  return $a;
}
function first_str($a, $paths) {
  foreach ($paths as $p) { $v = dig($a, $p); if (is_string($v) && one_line($v) !== '') return one_line($v); }
  return '';
}
function fmt_date($v) {
  if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', (string)$v, $m)) return (int)$m[3] . ' ' . MONTHS[(int)$m[2] - 1] . ' ' . $m[1];
  return one_line($v);
}
function fmt_time($v) {
  if (preg_match('/^(\d{1,2}):(\d{2})$/', (string)$v, $m)) { $h = (int)$m[1]; $ap = $h >= 12 ? 'PM' : 'AM'; $h = $h % 12 ?: 12; return "$h:{$m[2]} $ap"; }
  return one_line($v);
}

/* ---------- Firestore REST -> plain array ---------- */
function decode_value($v) {
  if (isset($v['stringValue']))    return $v['stringValue'];
  if (isset($v['integerValue']))   return (int)$v['integerValue'];
  if (isset($v['doubleValue']))    return $v['doubleValue'];
  if (isset($v['booleanValue']))   return $v['booleanValue'];
  if (isset($v['timestampValue'])) return $v['timestampValue'];
  if (isset($v['mapValue']))       { $o = []; foreach (($v['mapValue']['fields'] ?? []) as $k => $x) $o[$k] = decode_value($x); return $o; }
  if (isset($v['arrayValue']))     { return array_map('decode_value', $v['arrayValue']['values'] ?? []); }
  return null;
}
function http_get($url) {
  if (function_exists('curl_init')) {
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_FOLLOWLOCATION => true]);
    $body = curl_exec($c); $code = (int)curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
    return [$code, $body];
  }
  $ctx = stream_context_create(['http' => ['timeout' => 5, 'ignore_errors' => true]]);
  $body = @file_get_contents($url, false, $ctx);
  $code = 0; if (!empty($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $code = (int)$m[1];
  return [$code, $body];
}
/* returns array (doc), null (not found) or false (lookup failed) */
function fetch_invitation($id) {
  $mock = getenv('INV_MOCK_FILE'); // only used by local tests
  if ($mock) { $all = json_decode(file_get_contents($mock), true); return $all[$id] ?? null; }
  $url = 'https://firestore.googleapis.com/v1/projects/' . FIREBASE_PROJECT . '/databases/(default)/documents/' . COLLECTION . '/' . rawurlencode($id) . '?key=' . FIREBASE_API_KEY;
  [$code, $body] = http_get($url);
  if ($code === 404) return null;
  if ($code !== 200 || !$body) return false;
  $j = json_decode($body, true); if (!is_array($j)) return false;
  $out = []; foreach (($j['fields'] ?? []) as $k => $x) $out[$k] = decode_value($x);
  return $out;
}

/* ---------- image ---------- */
function first_image($data) {
  foreach (['heroImage','mainPhoto','coverPhoto','couplePhoto','couple.photo','photo','celebrantImage','groomPhoto','storyImage','closingImage','venuePhoto','venueImage','image'] as $k) {
    $v = dig($data, $k); if (is_string($v) && trim($v) !== '') return trim($v);
  }
  foreach (['gallery','journeyPhotos','programPhotos'] as $k) {
    $a = $data[$k] ?? null;
    if (is_array($a)) foreach ($a as $g) if (is_array($g) && !empty($g['src']) && is_string($g['src'])) return trim($g['src']);
  }
  return '';
}
/* Any uploaded photo -> 1200x630 JPEG (what WhatsApp/Facebook want, well under 300 KB) */
function og_image($src, $origin, $basePath, $templateId) {
  $tpl = preg_replace('/[^A-Za-z0-9_-]/', '', $templateId ?: 'royal-ivory');
  $fallback = "$origin$basePath/templates/$tpl/og.jpg";
  if (!preg_match('#^https://#i', $src)) return $fallback;                       // demo / relative / data: images -> template thumbnail
  if (preg_match('#res\.cloudinary\.com/.+/image/upload/#', $src)) {
    $u = preg_replace('#/image/upload/(?:[^/]*,[^/]*/)?#', '/image/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto:good/', $src, 1);
    return preg_replace('#\.(png|webp|avif|gif|jpeg)(\?.*)?$#i', '.jpg', $u);
  }
  if (strpos($src, 'images.unsplash.com/') !== false) {
    $p = parse_url($src); parse_str($p['query'] ?? '', $q);
    $q = array_merge($q, ['w' => 1200, 'h' => 630, 'fit' => 'crop', 'fm' => 'jpg', 'q' => 80]);
    return $p['scheme'] . '://' . $p['host'] . $p['path'] . '?' . http_build_query($q);
  }
  if (preg_match('#\.(jpe?g|png)(\?|$)#i', $src)) return $src;
  return $fallback;
}

/* ---------- template info (occasion / entry file) read from templates/<id>/register.js ---------- */
function template_info($tpl) {
  $id = preg_replace('/[^A-Za-z0-9_-]/', '', (string)$tpl);
  $info = ['id' => $id, 'occasion' => '', 'entry' => "templates/$id/index.html"];
  $f = __DIR__ . "/templates/$id/register.js";
  if ($id !== '' && is_file($f)) {
    $js = (string)@file_get_contents($f, false, null, 0, 4000);
    if (preg_match('/\boccasion\s*:\s*[\'"]([^\'"]+)[\'"]/', $js, $m)) $info['occasion'] = trim($m[1]);
    if (preg_match('/\bentry\s*:\s*[\'"]([^\'"]+)[\'"]/', $js, $m) && preg_match('#^templates/[A-Za-z0-9_-]+/[A-Za-z0-9_./-]+$#', $m[1])) $info['entry'] = $m[1];
  }
  return $info;
}
/* normalised occasion key: wedding | engagement | birthday | babyshower | housewarming | other */
function occasion_key($occ, $data, $doc) {
  $o = strtolower(preg_replace('/[^a-z]/i', '', (string)$occ));
  if (in_array($o, ['wedding','engagement','birthday','babyshower','housewarming'], true)) return $o;
  if (first_str($data, ['celebrant','babyName'])) return 'birthday';
  if (first_str($data, ['groom','groomName']) && first_str($data, ['bride','brideName'])) return 'wedding';
  return 'other';
}

/* ---------- meta ---------- */
function build_meta($doc, $id, $origin, $basePath) {
  $data = is_array($doc['data'] ?? null) ? $doc['data'] : [];
  $tpl  = (string)($doc['templateId'] ?? '');
  $groom = first_str($data, ['groom','groomName']); $bride = first_str($data, ['bride','brideName']);
  $celebrant = first_str($data, ['celebrant','babyName','name']);
  $date  = fmt_date(first_str($data, ['weddingDate','eventDate','date','ceremony.date']));
  $time  = fmt_time(first_str($data, ['weddingTime','eventTime','time']));
  $venue = clip(first_str($data, ['venue','venueName','ceremony.venue','map.title','venueAddress']), 70);
  $msg   = first_str($data, ['invitationMessage','message','blessingMessage','tagline','dateMessage','programMessage']);
  $ti   = template_info($tpl);
  $occ  = occasion_key($ti['occasion'], $data, $doc);
  $docTitle = clip($doc['title'] ?? '', 60);
  $couple = ($groom !== '' && $bride !== '') ? "$groom & $bride" : ($docTitle !== '' ? $docTitle : '');
  $who = $celebrant !== '' ? $celebrant : $docTitle;
  switch ($occ) {
    case 'wedding':
      $names = $couple !== '' ? $couple : 'Our Wedding'; $title = "$names | Wedding Invitation"; $lead = "You are warmly invited to the wedding of $names"; break;
    case 'engagement':
      $names = $couple !== '' ? $couple : 'Our Engagement'; $title = "$names | Engagement Invitation"; $lead = "You are warmly invited to the engagement of $names"; break;
    case 'birthday':
      $age = first_str($data, ['age']); $names = $who !== '' ? $who : 'Birthday Celebration';
      $title = $who !== '' ? "$who's Birthday Invitation" : 'Birthday Invitation';
      $lead = $who !== '' ? "Join us to celebrate $who" . ($age !== '' ? " turning $age" : '') : 'You are invited to a birthday celebration'; break;
    case 'babyshower':
      $names = $who !== '' ? $who : 'Baby Shower'; $title = $who !== '' ? "$who | Baby Shower Invitation" : 'Baby Shower Invitation'; $lead = 'You are invited to a baby shower' . ($who !== '' ? " for $who" : ''); break;
    case 'housewarming':
      $names = $who !== '' ? $who : 'Housewarming'; $title = $who !== '' ? "$who | Housewarming Invitation" : 'Housewarming Invitation'; $lead = 'You are invited to a housewarming' . ($who !== '' ? " – $who" : ''); break;
    default:
      $names = $who !== '' ? $who : 'You are invited'; $title = "$names | Digital Invitation"; $lead = "You are invited to $names";
  }
  $when = trim($date . ($time !== '' ? " at $time" : ''));
  $desc = $lead . ($when !== '' ? " on $when" : '') . ($venue !== '' ? ", $venue" : '') . '.';
  if ($msg !== '') $desc = clip("$desc $msg", 200);
  return [
    'title' => clip($title, 70), 'description' => $desc, 'url' => "$origin$basePath/invitation?id=" . rawurlencode($id),
    'image' => og_image(first_image($data), $origin, $basePath, $tpl), 'imageAlt' => "$names – digital invitation",
  ];
}
function generic_meta($origin, $basePath) {
  return [
    'title' => 'Digital Invitation | ' . SITE_NAME,
    'description' => 'View a personalized digital invitation – animated designs with RSVP, venue maps and music. Powered by AD Soft Technologies.',
    'url' => "$origin$basePath/invitation", 'image' => "$origin$basePath/templates/royal-ivory/og.jpg", 'imageAlt' => 'Digital invitation',
  ];
}
function meta_block($m) {
  $t = fn($n, $v) => '<meta name="' . $n . '" content="' . esc($v) . '">';
  $p = fn($n, $v) => '<meta property="' . $n . '" content="' . esc($v) . '">';
  return implode("\n  ", [
    '<title>' . esc($m['title']) . '</title>', $t('description', $m['description']), '<link rel="canonical" href="' . esc($m['url']) . '">',
    $p('og:type', 'website'), $p('og:site_name', SITE_NAME), $p('og:locale', 'en_IN'), $p('og:title', $m['title']), $p('og:description', $m['description']), $p('og:url', $m['url']),
    $p('og:image', $m['image']), $p('og:image:secure_url', $m['image']), $p('og:image:type', 'image/jpeg'), $p('og:image:width', '1200'), $p('og:image:height', '630'), $p('og:image:alt', $m['imageAlt']),
    $t('twitter:card', 'summary_large_image'), $t('twitter:title', $m['title']), $t('twitter:description', $m['description']), $t('twitter:image', $m['image']), $t('twitter:image:alt', $m['imageAlt']),
  ]);
}
function inject($html, $m, $inv = null) {
  $html = preg_replace('#<title>.*?</title>#is', '', $html, 1);
  $html = preg_replace('#<meta\s+name=["\']description["\'][^>]*>#i', '', $html, 1);
  $html = preg_replace('#<link\s+rel=["\']canonical["\'][^>]*>#i', '', $html, 1);
  $block = meta_block($m);
  if (is_array($inv) && !empty($inv['templateId'])) {
    $flags = JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_PARTIAL_OUTPUT_ON_ERROR;
    $block .= "\n  " . '<link rel="preload" as="script" href="templates/' . esc($inv['templateId']) . '/register.js">'
            . "\n  " . '<script>window.__INV__=' . json_encode($inv, $flags) . ';</script>';
    /* start downloading the template right away – in parallel with the scripts below */
    $html = preg_replace('#<iframe id="f"#', '<iframe id="f" src="' . esc($inv['entry']) . '?embed=live"', $html, 1);
  }
  return preg_replace_callback('#<head([^>]*)>#i', fn($x) => $x[0] . "\n  " . $block, $html, 1);
}

/* ---------- run ---------- */
if (PHP_SAPI === 'cli' && !getenv('INV_MOCK_FILE')) exit;
$https  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') || (($_SERVER['HTTP_CF_VISITOR'] ?? '') !== '' && strpos($_SERVER['HTTP_CF_VISITOR'], 'https') !== false);
$host   = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? 'www.adsofttechnologies.com';
$origin = 'https://' . trim(explode(',', $host)[0]);   // always https for crawlers / og:image
$basePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
$id = (string)($_GET['id'] ?? '');
$valid = (bool)preg_match('/^[A-Za-z0-9_-]{1,64}$/', $id);

$meta = generic_meta($origin, $basePath); $cacheHdr = 'public, max-age=0, s-maxage=60'; $inv = null;
if ($valid) {
  $cacheFile = rtrim(sys_get_temp_dir(), '/') . '/inv_meta2_' . md5($origin . $id) . '.json';
  $cached = (!getenv('INV_MOCK_FILE') && is_file($cacheFile) && time() - filemtime($cacheFile) < CACHE_SECONDS) ? json_decode(@file_get_contents($cacheFile), true) : null;
  if (is_array($cached) && isset($cached['meta'])) { $meta = $cached['meta']; $inv = $cached['inv'] ?? null; $cacheHdr = 'public, max-age=0, s-maxage=' . CACHE_SECONDS; }
  else {
    $doc = fetch_invitation($id);
    if (is_array($doc) && ($doc['status'] ?? '') !== 'unpublished') {
      $meta = build_meta($doc, $id, $origin, $basePath); $cacheHdr = 'public, max-age=0, s-maxage=' . CACHE_SECONDS;
      $ti = template_info($doc['templateId'] ?? '');
      /* the viewer renders from this copy at once (no Firebase round-trip); it refreshes quietly in the background */
      $inv = ['id' => $id, 'templateId' => $ti['id'], 'entry' => $ti['entry'], 'occasion' => $ti['occasion'],
              'title' => (string)($doc['title'] ?? ''), 'data' => is_array($doc['data'] ?? null) ? $doc['data'] : new stdClass()];
      if ($ti['id'] === '') $inv = null;
      @file_put_contents($cacheFile, json_encode(['meta' => $meta, 'inv' => $inv], JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR));
    } elseif ($doc === false) { $cacheHdr = 'no-store'; }
  }
}
$html = @file_get_contents(VIEWER_FILE);
if ($html === false) { http_response_code(500); header('Content-Type: text/plain'); echo 'Invitation page unavailable'; exit; }
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: ' . $cacheHdr);
echo inject($html, $meta, $inv);
