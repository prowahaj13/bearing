# Monetization setup

Bearing ships with the Pro paywall already built (see `js/script.js` and the
`#proCard` section in `index.html`). It is inert until you connect real
accounts. Nothing below can be faked — Lemon Squeezy and Google both verify
ownership and real payment activity on their end.

## 1. Lemon Squeezy (one-time $9–$19 license)

Why Lemon Squeezy over raw Stripe for this project: it issues license keys
automatically after purchase, and its license-validation API needs no secret
key, which keeps this a pure static site + one small serverless function
(no database required for a v1).

1. Create a free account at lemonsqueezy.com and finish store verification
   (they'll ask for basic business/tax info — this is real and required
   before you can accept live payments).
2. Create a **Product** → type "single payment" → set price ($9–$19 is
   reasonable for a one-time unlock like this).
3. Turn on **License keys** for that product (Product settings → License keys
   → enable, set activation limit e.g. 3 devices).
4. Copy the product's **checkout URL** (Products → your product → Copy
   checkout link) and paste it into `index.html`, replacing:
   ```html
   <a class="btn gold" id="buyLink" href="https://YOUR-STORE.lemonsqueezy.com/checkout/buy/YOUR-VARIANT-ID" ...>
   ```
5. Deploy to Netlify (see below) so `/.netlify/functions/verify-license`
   is live. That function is already written in
   `netlify/functions/verify-license.js` and needs no environment
   variables for the basic flow — it just proxies Lemon Squeezy's public
   `licenses/validate` endpoint so the browser never needs a secret key.
6. Test it yourself: buy your own product (Lemon Squeezy has a test mode
   toggle in store settings so you can do this without a real charge),
   get the license key from the confirmation email, paste it into
   Bearing's Settings tab, click Activate. If it unlocks Pro, the whole
   pipe works.

**This is the actual "process a few real transactions" verification step
from your plan** — it has to be you (or a test buyer) completing a real
Lemon Squeezy checkout. I can't do this for you; there's no account for me
to act through, and creating fake transaction history would misrepresent
the asset to any future buyer.

## 2. Deploying with the function enabled

```
netlify deploy --prod
```
or connect the GitHub repo in the Netlify dashboard. Netlify auto-detects
`netlify/functions/` from `netlify.toml` — no extra config needed. Confirm
it deployed by visiting `https://yoursite.netlify.app/.netlify/functions/verify-license`
directly; a POST-only 405 response (not a 404) means the function is live.

## 3. Google Analytics 4 (real traffic proof)

1. Create a GA4 property at analytics.google.com (free).
2. Admin → Data Streams → Web → copy the **Measurement ID** (`G-XXXXXXX`).
3. In `index.html`, replace both instances of `G-XXXXXXXXXX` with your real ID.
4. Redeploy. Traffic will start appearing in GA4's Realtime report within
   a few minutes of a real visit.

There's no way to backfill history — a buyer evaluating this asset will
want to see an actual GA4 property with a few weeks of real visits, so the
earlier you turn this on, the more useful the traffic history is later.

## 4. Alternative path: sell the whole asset instead of subscriptions

If you'd rather not run an ongoing paid product, the plan's "turnkey asset
for agencies" option skips all of the above: you sell the GitHub repo,
domain, and (if any) GA4/Lemon Squeezy accounts as a package on a
marketplace (see `docs/LISTING-DRAFT.md`). In that case Lemon Squeezy is
optional — you're selling code and traffic potential, not recurring
revenue.
