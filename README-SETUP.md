# Diary of Emotions – secured site: setup (10 minutes)

## Files
| File | What it is |
|---|---|
| `index.html`, `shop.html`, `about.html`, `contact.html`, `policies.html` | Public pages. **Customer login / sign-up / Google only. No admin code, no admin button.** |
| `admin.html` | The only place the admin panel exists. **Admin sign-in only** (no sign-up, no Google, no customer login). |
| `site.js` | Public-site logic (loaded only by the 5 public pages). |
| `common.js` | Shared helpers, pricing, theme (no privileged logic). |
| `style.css` | Shared styles. |
| `firestore.rules` | **The real security.** Must be published (step 1). |

Upload all files to the same folder on your host (they reference each other by relative path).

## Step 1 – Publish the security rules (REQUIRED)
Firebase Console → **Firestore Database → Rules** → paste the contents of `firestore.rules` → **Publish**.

This is what makes the site secure: only the account with UID `J3QSrYKfINYUmCOCBah7lNSf5T83` can create/change/delete products, settings, content, order status or moderate reviews. Anyone can read the catalogue; customers can only place orders and see their own; nobody else can read orders.
Until you publish these rules, the admin panel will say "permission denied" (or, if your database is still in test mode, it is open to everyone – publish them now).

## Step 2 – Check Authentication
Firebase Console → **Authentication → Sign-in method**: enable **Email/Password**, **Google** and **Anonymous** (Anonymous is used for guest checkout).
Authentication → Settings → **Authorized domains**: add your live domain.
Make sure the owner account (UID ending …Sf5T83) is an **Email/Password** user so it can sign in on `admin.html`.

## Step 3 – Recommended hardening
- Google Cloud Console → APIs & Services → Credentials → your Browser API key → **restrict to your website domain(s)**.
- Turn on **multi-factor authentication** for the owner account if available in your plan.
- Keep `admin.html` unlinked (it is already) – you can also rename it; nothing else refers to it. It is `noindex`, but the rules are the protection, not the secrecy of the URL.

## How admin changes reach the site
All admin actions write directly to Firestore (`products`, `settings/storefront`, `settings/content`, `orders`, `reviews`). Every public page listens live, so a change appears on all pages within about a second — products, prices, stock, discounts, master offer switch, seasonal campaigns, flash sale + countdown, theme colours, announcement bar, store name, contact links, delivery fee/UPI ID, and all page text (hero, home sections, shop, about, contact, policies, footer).

## First run
Open `admin.html` → sign in → **Products → "Import the 8 starter hampers"** (or add your own). Then edit text in **Pages & Content**.

## Behaviour notes
- Orders are saved to Firestore and shown live in Admin → Orders. Setting an order to **Confirmed** deducts stock automatically; **Cancelled** restores it.
- Product photos are resized/compressed in the browser (max 5, ~900px) to stay under Firestore's 1 MB document limit.
- Order totals are computed in the customer's browser, so the owner confirms each order manually (as before) – the rules cannot verify prices.
- The old Razorpay toggle was removed (it was not wired to anything); UPI / COD / WhatsApp checkout remain.
- A customer's cart is now remembered between pages.
