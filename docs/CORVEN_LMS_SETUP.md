# CORVEN Learning — activation guide

This guide activates the persistent Level Up pilot after the code has been
deployed.

## 1. Create an isolated Supabase project

Use a project dedicated to CORVEN Learning. Do not reuse PISTON keys, storage,
or database tables.

## 2. Apply database migrations

Run the files in `supabase/migrations` in filename order through the Supabase
SQL Editor or the Supabase CLI:

1. `20261007100000_corven_lms_foundation.sql`
2. `20261007130000_corven_lms_operational.sql`

The second migration hardens course access, adds audit events and creates the
public organization-assets bucket for academy logos.

## 3. Configure authentication URLs

Set the Supabase Site URL to the production domain. Add these redirect URLs:

- `https://corvenwebsite.vercel.app/learning/auth/callback`
- Preview URL patterns used by the team, if previews need authentication.

For production email delivery, configure a custom SMTP provider before sending
student invitations at scale.

## 4. Add Vercel environment variables

Add the following values to Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL=https://corvenwebsite.vercel.app`

Never expose `SUPABASE_SECRET_KEY` using a `NEXT_PUBLIC_` prefix.

## 5. Create the first administrators

Locally export the variables from `.env.example`, including the real email and
name of the CORVEN owner and Level Up administrator, then run:

```bash
npm run lms:bootstrap
```

The script is safe to rerun. It finds existing users before inviting new ones,
assigns the CORVEN owner role, and creates the Level Up administrator
membership.

## 6. Validate

1. Accept each invitation and create a password.
2. Sign in at `/learning/login`.
3. Invite one test student.
4. Create a draft course with a YouTube link.
5. Publish the course and enroll the test student.
6. Confirm that a suspended student cannot open course content.
7. Submit and answer one support ticket.

The public demonstration remains available at `/demo/learning` and does not use
or expose production data.
