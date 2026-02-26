# Admin Guide

## Access
- Visit `/admin` (must be admin=true in `profiles`).
- Key areas: **Dashboard**, **Bulk Invites**, **Invites**, **Applications**, **Analytics**, **Guide**.

## Bulk Invites
1. Create a campaign (name + source).
2. Upload CSV with: `full_name,email,company,title,notes,code(optional)`.
3. Send preview to yourself, then send campaign.
4. Track: sent, opens, clicks, signups, conversion, member quality (avg Impact Score of converts).
5. You can **delete** test campaigns or **archive** old ones.

## Manual Review
- New signups land in **Applications**.
- Approve/reject; approval flips `profiles.status` to `active`.

## Messaging & Notifications
- `/api/notifications/send` supports: `type: 'new_message' | 'request_reply'`.
- Add more types as needed in `lib/sendgrid-templates.js`.

## Reports
- Export per‑campaign CSVs.
- View funnels and cohort curves in **Analytics**.
