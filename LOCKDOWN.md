# Household auth lockdown

Run these steps in order. Do not paste `supabase/lockdown.sql` until Eve has signed in on the live site.

1. Merge and deploy this code first so the login screen is live.
2. Supabase Dashboard → Authentication → URL configuration: add Redirect URLs `https://eveamram.github.io/calender.github.io/` and `http://localhost:5173/`.
3. Set Site URL to `https://eveamram.github.io/calender.github.io/`.
4. Disable public signup (Authentication → Providers → Email): keep confirm emails on; disable new user signups if the toggle exists, otherwise use Invite only.
5. Invite Eve: `amram.eve@gmail.com`. Invite Abbie later with her real email (do not guess it).
6. Eve opens the live site, requests a magic link, and signs in. Confirm household data still loads.
7. Then run `supabase/lockdown.sql` in the Supabase SQL editor.
8. Verify a logged-out window cannot see data (incognito / private browsing).
9. To add Abbie: Authentication → Invite user, using her real email.
