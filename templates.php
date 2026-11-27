<?php
/* Auto-discovers invitation templates.
   Every folder inside /templates/ that contains a register.js is listed (folders starting with "_" or "." are skipped,
   add an empty file called ".hidden" inside a folder to keep it off the gallery without deleting it).
   js/inv-platform.js calls this file when create-invitation opens, so a new folder shows up by itself - no list to edit. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

$root = __DIR__ . '/templates';
$out = [];
foreach ((array)glob($root . '/*', GLOB_ONLYDIR) as $dir) {
  $id = basename($dir);
  if (!preg_match('/^[A-Za-z0-9][A-Za-z0-9-]*$/', $id)) continue;      // same rule the platform uses
  $reg = $dir . '/register.js';
  if (!is_file($reg) || is_file($dir . '/.hidden')) continue;
  $card = $dir . '/card.jpg';
  $t = (int)@filemtime($reg);
  $out[] = ['id' => $id, 't' => $t, 'v' => max($t, is_file($card) ? (int)@filemtime($card) : 0)];
}
echo json_encode(['templates' => $out], JSON_UNESCAPED_SLASHES);
