# ALVOXIS backend — Supabase + Stripe

The site itself is static (GitHub Pages, `https://alvoxis.eu`). Everything that
must be trusted runs in Supabase:

| Piece | Where |
|---|---|
| Accounts (email + password, Google) | Supabase Auth |
| Profiles, orders, order items, support contributions, gifts | PostgreSQL + Row Level Security — `migrations/` |
| Gift / personalisation photos | Private Storage buckets `gift-photos`, `order-photos` — `migrations/…_storage.sql` |
| Pricing + Stripe Checkout Session | Edge Function `create-checkout-session` |
| Payment confirmation (the only thing that marks anything paid) | Edge Function `stripe-webhook` |

## Go-live checklist

1. **Public browser config** — `js/config.js`: set `SUPABASE_URL` and
   `SUPABASE_PUBLISHABLE_KEY` (Dashboard → Project Settings → API Keys).
   Both are public by design; access is enforced by RLS.
2. **Database + functions** — add three GitHub repository secrets
   (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`)
   and run the **Deploy Supabase** workflow (Actions tab), or locally:
   ```sh
   supabase link --project-ref <ref>
   supabase db push
   supabase functions deploy create-checkout-session --no-verify-jwt
   supabase functions deploy stripe-webhook --no-verify-jwt
   ```
   Do **not** run `supabase config push`: Auth (Google, email confirmation,
   redirect URLs) is already configured in the Dashboard and `config.toml`
   only mirrors it for local development.
3. **Edge Function secrets** (Dashboard → Edge Functions → Secrets):
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL=https://alvoxis.eu`,
   optionally `STRIPE_PRICE_MINI` / `STRIPE_PRICE_CLASSIC` (existing Prices are
   used only if they charge exactly €49.99 / €59.99 EUR).
4. **Stripe webhook** (Stripe Dashboard → Developers → Webhooks):
   endpoint `https://<ref>.supabase.co/functions/v1/stripe-webhook`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `charge.refunded`. Its signing secret is `STRIPE_WEBHOOK_SECRET`.
5. **Auth redirect URLs** (Dashboard → Authentication → URL Configuration):
   Site URL `https://alvoxis.eu`, and allow `https://alvoxis.eu/**` and
   `https://www.alvoxis.eu/**` — sign-up confirmation, password reset and
   Google all return to `https://alvoxis.eu/?flow=…`.

## Money and trust rules

- The browser sends only product ids, quantities, personalisation and the
  support amount. Prices come from `functions/_shared/catalog.ts`.
- Support amounts are €1.00–€100.00, re-validated server-side and by a
  database constraint.
- `payment_status = 'paid'` is written only by `stripe-webhook`, after the
  Stripe signature is verified and the paid amount matches the record.
- Webhooks are idempotent (`stripe_events`, unique session / payment-intent
  ids, one gift per contribution).
- A gift exists only for a **paid** contribution of **€50.00 or more**
  (enforced by the webhook and by a database check constraint).
- Users can read only their own rows; they can change only their display
  name and their gift photo (through `set_gift_photo` / `clear_gift_photo`).
