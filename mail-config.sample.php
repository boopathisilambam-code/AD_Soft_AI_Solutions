<?php
/* =========================================================
   Copy this file to  mail-config.php  (same folder, public_html) and fill in your mailbox.
   mail-config.php is PHP, so visitors can never read the password through the browser.
   ========================================================= */
return [
  /* ---- OPTION A (recommended): Hostinger mailbox  ----
     hPanel > Emails > Email Accounts > create  no-reply@adsofttechnologies.com  (free with most Hostinger plans) */
  'transport'  => 'smtp',
  'host'       => 'smtp.hostinger.com',
  'port'       => 465,
  'secure'     => 'ssl',
  'username'   => 'no-reply@adsofttechnologies.com',
  'password'   => 'PUT-THE-MAILBOX-PASSWORD-HERE',
  'from_email' => 'no-reply@adsofttechnologies.com',
  'from_name'  => 'AD Soft Technologies',

  /* ---- OPTION B: Brevo free SMTP (300 mails/day) — use it if your Hostinger plan has no mailbox ----
  'transport'  => 'smtp',
  'host'       => 'smtp-relay.brevo.com',
  'port'       => 587,
  'secure'     => 'tls',
  'username'   => 'your-brevo-login@example.com',      // Brevo > SMTP & API > SMTP  (login)
  'password'   => 'your-brevo-smtp-key',               // the SMTP key, NOT your account password
  'from_email' => 'no-reply@adsofttechnologies.com',   // must be a verified sender / domain in Brevo (add the SPF + DKIM records Brevo shows)
  'from_name'  => 'AD Soft Technologies',
  */

  /* ---- OPTION C: PHP mail() — no password, but lands in spam more often ----
  'transport'  => 'mail',
  'from_email' => 'no-reply@adsofttechnologies.com',
  */

  'reply_to'      => '',                                   // e.g. 'hello@adsofttechnologies.com' (optional)
  'site_url'      => 'https://www.adsofttechnologies.com',
  'viewer_path'   => '/invitation',
  'allowed_hosts' => ['www.adsofttechnologies.com', 'adsofttechnologies.com'],

  /* anti-spam limits (this endpoint can only mail the owner's own invitation link, but keep these anyway) */
  'limit_ip_hour'   => 12,
  'limit_email_day' => 6,
  'limit_id_day'    => 10,
];
