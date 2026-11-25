# Invitation link by email (hidden link) - setup

Flow: Publish -> link is NOT shown -> "Copy link" opens popup "Enter your Gmail ID" -> email saved in Firebase
(`invitationLeads/<invitationId>`) -> link is emailed automatically via EmailJS.

## 1. EmailJS (free: 200 mails/month, pure JavaScript, no PHP)
1. https://www.emailjs.com -> sign up -> **Email Services** -> Add Gmail/your Hostinger SMTP -> copy **Service ID**.
2. **Email Templates** -> Create. Set **To email** = `{{to_email}}`. Subject: `Your invitation link - {{invitation_title}}`.
   Body example:
   ```
   Hi, your invitation "{{invitation_title}}" is ready.
   Your link: {{invitation_link}}
   Share it with your guests on WhatsApp.  - {{site_name}}
   ```
   Copy the **Template ID**.
3. **Account -> General** -> copy **Public Key**.
4. **Account -> Security**: add allowed domain `www.adsofttechnologies.com`, turn on reCAPTCHA / rate limit.
5. Paste the 3 values in `js/inv-config.js` -> `emailjs`.

## 2. Firestore rules (add inside `match /databases/{database}/documents { ... }`)
```
match /invitationLeads/{id} {
  allow create: if request.auth != null
                && request.resource.data.ownerUid == request.auth.uid
                && request.resource.data.email is string
                && request.resource.data.email.size() < 120;
  allow update: if request.auth != null
                && resource.data.ownerUid == request.auth.uid
                && request.resource.data.ownerUid == resource.data.ownerUid;
  allow read, delete: if false;   // only you, from Firebase console / Admin SDK
}
```
Keep your existing `premiumInvitations` rules as they are. Emails are NOT stored in the invitation document
(that document is public), so guests can never read them.

## 3. Where do I see the emails?
Firebase console -> Firestore -> `invitationLeads` (fields: email, invitationId, title, status = pending / sent / send-failed).
