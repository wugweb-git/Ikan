# 3 new resource drafts — video, audio, podcast

For review before anything goes live. None of these are written to the database yet.

## Why these sources

Nobody on the team recorded original video/audio, so I searched for real, currently-live,
reputable, freely-embeddable content rather than inventing links. All three are from
recognized health/wellness sources and link to content that actually exists right now:

- **Video**: NHS "Every Mind Matters" — an official UK National Health Service channel.
- **Audio**: The Free Mindfulness Project, hosting a 5-minute breathing exercise recorded by
  UCLA's Mindful Awareness Research Centre (MARC), under a Creative Commons
  Attribution-NonCommercial-ShareAlike license — free to use with attribution, which is included
  in the content below.
- **Podcast**: "Ten Percent Happier with Dan Harris" on Spotify, a mainstream, well-reviewed
  mental-health podcast — episode specifically about managing stress.

None of these are iKan-produced content — they're curated third-party resources, same as any
content library would do. If you'd rather only publish original content, say so and I'll pull
these.

## Code fix made alongside this (approved earlier)

`ResourceDetail.tsx` line 84 was reading `category` before `contentType` when deciding what badge
to show, so the badge always displayed the topic (e.g. "stress") instead of the format. Fixed —
`contentType` now wins. This is why these 3 drafts are the first records that will actually show
"Video" / "Audio" / "Podcast" badges correctly; the existing 9 will keep showing their category,
same as before.

## Schema note

`resource.content` in the live database is a **single HTML string** — not an array of blocks like
I first assumed. The frontend parses it client-side. A `<p>` tag's inner HTML is preserved as-is
when rendered, so a `<p>` wrapping an `<iframe>` or `<audio>` element renders as a real, working
embed (verified against `ResourceDetail.tsx`'s parser: `iframe`/`audio` aren't in the HTML5 set of
tags that auto-close an open `<p>`, so the nesting survives parsing).

---

## 1. Video — Stress

```json
{
  "title": "5 Minutes That Can Change How You Handle Stress",
  "description": "A short NHS video on practical, everyday ways to take the edge off stress — no equipment, no app, just five minutes.",
  "category": "stress",
  "contentType": "Video",
  "thumbnail": "https://img.youtube.com/vi/z7ATOc4ShOc/hqdefault.jpg",
  "readTime": "4 min watch",
  "author": "NHS Every Mind Matters",
  "published": true,
  "featured": false,
  "content": "<p>Stress shows up as racing thoughts, a tight chest, snapping at people you don't mean to snap at. The good news: you don't need a retreat or a subscription to start doing something about it today.</p><p>This short video from the NHS's Every Mind Matters programme walks through a handful of things you can actually do — right now, with nothing but a few minutes.</p><p><iframe width=\"100%\" height=\"315\" src=\"https://www.youtube.com/embed/z7ATOc4ShOc\" title=\"Stress - Things You Can Do\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></p><p>If this resonates, Every Mind Matters has a free personalised action plan at nhs.uk/every-mind-matters — five questions, a plan built around your answers.</p>"
}
```

## 2. Audio — Guided breathing

```json
{
  "title": "Listen: A 5-Minute Guided Breathing Exercise for Anxious Moments",
  "description": "A guided breath-awareness practice you can do anywhere — on a break, before a hard conversation, or when your mind won't slow down.",
  "category": "mental-health",
  "contentType": "Audio",
  "thumbnail": "",
  "readTime": "6 min listen",
  "author": "Mindful Awareness Research Centre, UCLA",
  "published": true,
  "featured": false,
  "content": "<p>Sometimes the fastest way back to calm isn't thinking your way there — it's just paying attention to your breath for a few minutes, on purpose.</p><p>This recording is a simple, guided breathing practice: no background music, no jargon, just a clear voice bringing your attention back to the breath whenever it wanders.</p><p><audio controls style=\"width: 100%;\"><source src=\"https://drive.google.com/uc?export=download&id=1eucLhrVRBT7FCTzdbpns7MCLb4PILK0t\" type=\"audio/mpeg\">Your browser does not support the audio element.</audio></p><p><em>Recorded by the Mindful Awareness Research Centre (MARC) at UCLA, shared via The Free Mindfulness Project under a Creative Commons Attribution-NonCommercial-ShareAlike license.</em></p>"
}
```

**Caveat on this one, stated plainly:** the audio file is hosted on Google Drive (the source
site's own distribution link), not on infrastructure we control. Google Drive direct-download
links can occasionally require a one-time confirmation click in some browsers instead of playing
inline, and Google could change the link format. If you want this fully reliable long-term, the
honest best-way fix is to download the MP3 and re-host it on our own storage (e.g. Supabase
Storage) rather than linking out. Happy to do that if you want it done properly rather than fast.

## 3. Podcast — Managing stress

```json
{
  "title": "Podcast: How to Handle Stress Better, with Dr. Modupe Akinola",
  "description": "A conversation with a Columbia Business School professor on what actually works — and what doesn't — when it comes to managing everyday stress.",
  "category": "general",
  "contentType": "Podcast",
  "thumbnail": "",
  "readTime": "Full episode",
  "author": "Ten Percent Happier with Dan Harris",
  "published": true,
  "featured": false,
  "content": "<p>Most stress advice is either too vague to act on or too clinical to remember when you actually need it. This episode of Ten Percent Happier is neither — a real conversation about what research actually says helps, from someone who studies it for a living.</p><p><iframe style=\"border-radius:12px\" src=\"https://open.spotify.com/embed/episode/5IvwJBttwqfAgJspvpyB43?utm_source=generator\" width=\"100%\" height=\"232\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe></p><p>Worth a listen on a commute, a walk, or whenever you've got 30-40 minutes to actually sit with it.</p>"
}
```

---

## Before these go anywhere

1. I didn't fabricate `thumbnail` images for #2 and #3 — I don't have a real one I can confirm
   works, and a broken image is worse than none. The card will just render without an image for
   those two unless you want me to find or generate one.
2. All three are currently drafted as `published: true` — flip to `false` if you want to review
   them live (as an admin) before they're public.
3. Say the word and I'll either (a) walk you through pasting these into the admin resource
   editor, or (b) write them directly to the database via SQL — same caveat as the assessment
   repair: that's a direct production write and may need your explicit go-ahead past Cowork's
   safety classifier.
