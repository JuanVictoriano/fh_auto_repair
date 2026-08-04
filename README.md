# F&H Auto Repair — website

Static site. Four pages, no build step, no dependencies, no payment processing.
Drop the folder on any host and it runs.

```
fh-auto-repair/
├── index.html        Landing page — hero slideshow + live status readout
├── services.html     Services & Pricing — itemized estimate tickets
├── about.html        About Us
├── contact.html      Contact Us — hours, map, estimate request form
├── css/styles.css    Single stylesheet, all design tokens at the top
├── js/main.js        Nav, slideshow, open/closed status. ~180 lines, no libraries.
└── images/           slide-1.jpg, slide-2.jpg, slide-3.jpg (placeholders)
```

## Replace before launch

| What | Where | Notes |
|---|---|---|
| Phone `(718) 555-0142` | All 4 pages | Reserved fictional number. Find/replace both the display text and the `tel:+17185550142` hrefs. |
| Email `service@fhautorepair.com` | All 4 pages | |
| Slideshow photos | `images/slide-1..3.jpg` | Placeholders. Use real shop photos at 2400×1350 or larger, same 16:9 crop — no CSS changes needed. Also update the `alt` text and each slide's `data-label` caption. |
| Shop hours | `js/main.js` → `HOURS` object | Currently Mon–Fri 9–6, Sat 9–5, Sun closed. If they change, edit the object first, then match the visible labels in `contact.html` and the footer block on all four pages. |
| Prices | `services.html` → `.row__price` | Plain text, edit directly. |
| 6 bays, ASE certification, 24mo warranty, $145/hr | `index.html`, `about.html`, `services.html` | Written as realistic examples. (Founding year 1993 is confirmed and used throughout.) |
| Transit directions | `contact.html` → "Getting here" | Deliberately general. Verify the nearest J stop and bus routes before publishing specifics. |
| Form endpoint | `contact.html` → `<form action="">` | Empty on purpose. See below. |

## Wiring up the contact form

The form validates in the browser but posts nowhere until you set `action`. Two options:

**Form service** — Formspree, Basin, or Netlify Forms. Paste their endpoint into `action` and you're done.

**Salesforce Web-to-Case** — hidden fields are already stubbed in a comment above the
first input. Set `action` to your org's Web-to-Case servlet, uncomment `orgid` /
`retURL` / `origin`, and rename the inputs to the Case API names (`name`, `email`,
`phone`, `subject`, `description`). The `vehicle` and `service` fields map cleanly to
custom fields on Case if you'd rather keep them structured than fold them into
`description`.

Either way: no payment fields, no cart, no checkout anywhere on the site.

## Deploying to GitHub Pages

```bash
git init && git add . && git commit -m "F&H Auto Repair site"
git remote add origin git@github.com:USER/REPO.git
git push -u origin main
```

Then Settings → Pages → deploy from `main` / root. Every path in the site is relative,
so it works from a subdirectory (`user.github.io/repo/`) without changes.

## Design system

Tokens live at the top of `styles.css` — the full brand palette is declared as CSS
custom properties and nothing is hardcoded below it.

- **Structure**: `--black` and `--charcoal` for the shop-floor bands, `--off-white` for reading surfaces.
- **Red is reserved for actions.** Buttons, the active nav underline, section ticks. Nothing decorative.
- **Blue** carries informational labels (eyebrows, spec keys); **safety orange** is status and attention only.
- **Type**: Archivo (expanded 800, uppercase) for display, IBM Plex Sans for body, IBM Plex Mono for every number on the site.

## Accessibility & behavior

- Skip link, visible focus rings, labeled form fields, `aria-current` on the active nav item.
- Slideshow: auto-advances every 6.5s, pauses on hover and on keyboard focus, stops when the tab is hidden, and does not auto-advance at all under `prefers-reduced-motion`. Arrow keys work while the hero has focus.
- The status readout computes open/closed against `America/New_York`, so it's correct regardless of the visitor's device timezone. It re-checks every 60 seconds.
- Zero horizontal overflow from 320px to 1920px.
- `@media print` strips the nav, hero, and footer so a customer can print the pricing page cleanly.
