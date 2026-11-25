# Invitation link by e-mail (free setup)

Flow: Publish -> "Your invitation is live" (link NOT shown) -> tap **Copy invitation link** -> popup asks for Gmail ->
the e-mail is saved in Firebase (`invitationLeads`) and `send-invitation.php` mails the link to that address.

## 1. Files to upload to Hostinger `public_html`
`send-invitation.php`, `mail-config.sample.php`, `js/inv-platform.js`, `css/inv-platform.css`, `create-invitation.html`

## 2. Mailbox (free)
hPanel > Emails > Email Accounts > create `no-reply@adsofttechnologies.com`.
Then copy `mail-config.sample.php` to `mail-config.php` and put the mailbox password in it (Option A, Hostinger SMTP, port 465 SSL).
No mailbox in your plan? Use Option B (Brevo free, 300 mails/day) in the same file and add Brevo's SPF + DKIM DNS records.
hPanel > Emails > check SPF / DKIM / DMARC are "active" so mails do not go to spam.

## 3. Firestore rules (Firebase console > Firestore > Rules) — add inside `match /databases/{database}/documents { ... }`
```
match /invitationLeads/{leadId} {
  allow create: if request.auth != null
                && request.resource.data.ownerUid == request.auth.uid
                && request.resource.data.email is string
                && request.resource.data.email.size() < 161
                && request.resource.data.email.matches('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
  allow read, update, delete: if false;     // only you, in the Firebase console
}
```
Collected e-mails: Firebase console > Firestore > `invitationLeads` (email, invitationId, title, createdAt).
Anonymous sign-in must be enabled (Authentication > Sign-in method > Anonymous) — the editor already needs it.

## 4. Test
Publish a test invitation -> tap Copy invitation link -> enter your own Gmail -> mail arrives (check Spam once, mark "Not spam").
Errors are written to the PHP error log (hPanel > Websites > Advanced > Error logs).

## Notes
- `send-invitation.php` only mails the link if the Firebase user that is calling really owns that invitation, and is rate-limited
  (12/hour per IP, 6/day per e-mail, 10/day per invitation; edit in mail-config.php).
- The link name is now generated automatically (`names-xxxxx`) and is not shown anywhere in the publish popup.
- `config.mailEndpoint` / `config.leadsCollection` in `js/inv-config.js` can override the defaults.
- Local test (`run-local.bat` / serve.py has no PHP): the e-mail step will fail locally; the lead is still saved.
