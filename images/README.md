# Site photos

These are the **web-optimized images the site loads** (referenced by `styles.css` as
`url('images/<slot>.jpg')`). Each is a resized/compressed copy (long edge ~2000 px, ~280–620 KB)
of a full-resolution original kept in the repo-root **`/images`** archive.

Every image area also has a refined gradient fallback in `styles.css`, so the site still looks
intentional if a file is missing.

## What's here now
**Lost Trail** (from the `CAMPFIRE-RANCH-LOST-TRAIL-LODGE-*` originals):

| Filename | Where it shows | Source original |
|---|---|---|
| `hero.jpg` | Homepage full-screen hero | `…LODGE-13` (lodge in the pines) |
| `lost-trail.jpg` | Home location card **+** Lost Trail page hero | `…LODGE-9` (sunlit lodge) |
| `lt-1.jpg` | Galleries + Instagram strip | `…LODGE-19` (great room) |
| `lt-2.jpg` | Galleries + Instagram strip | `…LODGE-33` (bedroom) |
| `lt-3.jpg` | Galleries + Instagram strip | `…LODGE-21` (deck + canyon) |
| `lt-4.jpg` | Galleries + Instagram strip | `…LODGE-30` (kitchen + dining table) |
| `lt-5.jpg` | Galleries + Instagram strip | `…LODGE-3` (Coldstream creek) |
| `lt-6.jpg` | Galleries + Instagram strip | `…LODGE-1` (arched windows + golden aspen) |

**Thelma** (from the high-res `Thelma Hut *` / `Thelma Winter *` / `IMG_*` originals):

| Filename | Where it shows | Source original |
|---|---|---|
| `thelma.jpg` | Home location card **+** Thelma page hero | `Thelma Hut 13` (dusk, hut + peak) |
| `rmp-1.jpg` | Thelma gallery | `Thelma Hut 20` (kitchen / dining) |
| `rmp-2.jpg` | Thelma gallery | `Thelma Hut 16` (deck + the view) |
| `rmp-3.jpg` | Thelma gallery | `Thelma Hut 28` (bedroom) |
| `rmp-4.jpg` | Thelma gallery | `Thelma Hut 27` (bunk room) |
| `rmp-5.jpg` | Thelma gallery | `Thelma Winter 01` (snow, dusk) |
| `rmp-6.jpg` | Thelma gallery | `IMG_7537` (ski touring) |

## To swap or add a photo
Easiest: replace the web copy here directly (keep the same filename; JPG, ~2000 px long edge,
under ~500 KB). Or drop a new full-res shot in the repo-root `/images` archive and regenerate the
web copy from it. New gallery slots also need a matching `.img-*` rule in `styles.css`.

## Rights
The Lost Trail set was originally shot for Campfire Ranch — confirm SIG has the right to publish
before the site goes live.
