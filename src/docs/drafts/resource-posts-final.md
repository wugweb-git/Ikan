# 3 resource posts — final, ready to publish

Paste each JSON block into the admin resource editor (or send to `POST /admin/resources` as the
request body) to create the record. Written against the live `resource:` schema in
`resource-routes.ts` — the backend accepts any fields you send, so these will save as-is.

Each is now a full article (several hundred words, multiple sections) built around the embed,
rather than a short intro/outro — matching the depth of the existing 9. Claims about what's
physically happening during stress/anxiety are kept to well-established, non-controversial facts.
Claims about the podcast episode's specific content are kept general and clearly hedged, since I
haven't listened to the full episode — I'm not inventing what the guest said.

---

## 1. Video — "5 Minutes That Can Change How You Handle Stress"

```json
{
  "title": "5 Minutes That Can Change How You Handle Stress",
  "description": "A short NHS video on practical, everyday ways to take the edge off stress — no equipment, no app, just five minutes.",
  "category": "stress",
  "contentType": "Video",
  "thumbnail": "https://img.youtube.com/vi/z7ATOc4ShOc/hqdefault.jpg",
  "readTime": "4 min watch",
  "author": "Vedanshu",
  "published": true,
  "featured": false,
  "content": "<p>Stress shows up as racing thoughts, a tight chest, snapping at people you don't mean to snap at, lying awake re-running a conversation from nine hours ago. Most advice for dealing with it asks for things you don't have on a bad day — an hour, a quiet room, a plan, a willingness to 'just relax.' This is built around the opposite assumption: that the only resource you reliably have on a stressful day is five minutes.</p><h2>What stress is actually doing to you</h2><p>Stress isn't only a mental state — it's a physical one. Your body responds to a looming deadline much the same way it responds to a genuine threat: heart rate up, breathing shallower and higher in the chest, muscles — especially the shoulders and jaw — tensed and ready for something that, in a work context, usually never comes. Left running for long enough, that physical state starts affecting sleep, digestion, concentration and mood, independent of whatever triggered it in the first place.</p><p>This is also why 'just relax' doesn't work as advice: it asks you to override a physical state with a thought, which is roughly backwards. It's far more effective to change the physical state directly — slower breathing, released muscle tension, a change of physical position — and let your mental state follow, which it reliably does.</p><h2>Why five minutes is enough to matter</h2><p>You don't need to resolve what's stressing you to feel less wound up by it. A short, deliberate action — a few slow breaths, a brief walk, consciously dropping your shoulders — can measurably lower that physical stress response in minutes, well before the actual problem is anywhere close to solved. The goal isn't to fix the stressor. It's to stop your body from treating an email as a predator.</p><h2>What's in the video</h2><p>This short video from the NHS's Every Mind Matters programme walks through a handful of things you can actually do in the moment — practical, not theoretical, and built for people who don't have a spare hour or a meditation app subscription.</p><p><iframe width=\"100%\" height=\"315\" src=\"https://www.youtube.com/embed/z7ATOc4ShOc\" title=\"Stress - Things You Can Do\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></p><h2>Three ways to make this stick</h2><ul><li><strong>Pick one technique, not all of them.</strong> Trying to adopt five new habits in one afternoon is its own source of stress. One, used consistently, beats five used once.</li><li><strong>Use it early, not just at the worst moment.</strong> The next time you notice your shoulders creeping up toward your ears — not just when you're already overwhelmed — is the better time to practice.</li><li><strong>Name the stressor, in one sentence, out loud or in writing.</strong> Vague stress ('everything') is much harder to act on than a specific one ('this one email I'm avoiding').</li></ul><h2>If five minutes isn't enough</h2><p>Some stress is situational and passes once the situation does. Some is more persistent, and worth actually measuring rather than guessing at — the Stress assessment in this app takes about four minutes and gives you a clearer read on where you stand than 'I think I'm pretty stressed lately' does. And if this resonates more broadly, Every Mind Matters has a free personalised action plan at nhs.uk/every-mind-matters — five questions, a plan built around your answers.</p>"
}
```

## 2. Audio — "Listen: A 5-Minute Guided Breathing Exercise for Anxious Moments"

```json
{
  "title": "Listen: A 5-Minute Guided Breathing Exercise for Anxious Moments",
  "description": "A guided breath-awareness practice you can do anywhere — on a break, before a hard conversation, or when your mind won't slow down.",
  "category": "mental-health",
  "contentType": "Audio",
  "thumbnail": "",
  "readTime": "6 min listen",
  "author": "Vedanshu",
  "published": true,
  "featured": false,
  "content": "<p>Sometimes the fastest way back to calm isn't thinking your way there — it's paying attention to your breath for a few minutes, on purpose. It sounds too simple to matter. It also happens to work, which is a large part of why guided breathing shows up across anxiety research, clinical therapy and mindfulness practice alike, despite those fields not agreeing on much else.</p><h2>Why breath, specifically</h2><p>Breathing is one of the few bodily processes that runs on its own but that you can also take deliberate control of at any moment. That makes it a rare, direct lever: slowing your breath down on purpose is one of the most reliable ways to signal to your nervous system that you're not in danger right now — which, in an anxious moment, is often most of what's actually needed before anything else gets solved. You can't will your heart rate down directly. You can, with practice, do it through your breath.</p><h2>What this is — and isn't</h2><p>This isn't a breathing 'technique' with counts to memorize or a method you can get wrong. It's a guided practice: a recorded voice doing the pacing for you, so the only thing you need to bring is five minutes and a willingness to let your attention rest somewhere other than whatever's been looping in your head.</p><h2>Before you press play</h2><ul><li>Find five minutes where you won't be interrupted — mid-task doesn't work as well as a real pause between things.</li><li>Sit or lie down somewhere you can let your shoulders drop without holding yourself up.</li><li>Headphones help with focus but aren't required.</li></ul><p>This recording is a simple, guided breathing practice: no background music, no jargon, just a clear voice bringing your attention back to the breath whenever it wanders — and it will wander. That's normal, not a sign you're doing it wrong. Noticing that your mind drifted and gently returning is, if anything, the actual practice.</p><p><audio controls style=\"width: 100%;\"><source src=\"https://drive.google.com/uc?export=download&id=1eucLhrVRBT7FCTzdbpns7MCLb4PILK0t\" type=\"audio/mpeg\">Your browser does not support the audio element.</audio></p><h2>After the practice</h2><p>Notice what's different, even slightly — a slower heart rate, looser shoulders, a quieter head, a few seconds of actual stillness before the next thought arrives. You don't need a dramatic shift for this to be working. A small one, repeated regularly rather than reached for only in a crisis, is the actual mechanism — this works better as a daily few minutes than as a once-a-month emergency measure.</p><h2>Where this fits</h2><p>A single five-minute practice won't resolve ongoing anxiety any more than one gym session builds fitness. Used consistently, though, it's a genuinely well-supported way to lower your baseline — worth pairing with an honest look at where you actually stand, which is what this app's assessments are for.</p><p><em>Recorded by the Mindful Awareness Research Centre (MARC) at UCLA, shared via The Free Mindfulness Project under a Creative Commons Attribution-NonCommercial-ShareAlike license.</em></p>"
}
```

*Standing note, not a blocker: this links to the source's own Google Drive file rather than our
storage. Works today; re-host on Supabase Storage later if you want it fully under our control.*

## 3. Podcast — "Podcast: How to Handle Stress Better, with Dr. Modupe Akinola"

```json
{
  "title": "Podcast: How to Handle Stress Better, with Dr. Modupe Akinola",
  "description": "A conversation with a Columbia Business School professor on what actually works — and what doesn't — when it comes to managing everyday stress.",
  "category": "general",
  "contentType": "Podcast",
  "thumbnail": "",
  "readTime": "Full episode",
  "author": "Vedanshu",
  "published": true,
  "featured": false,
  "content": "<p>Most stress advice falls into one of two unhelpful categories: too vague to act on ('just relax,' 'take some me-time') or too clinical to remember in the moment you actually need it. This episode of Ten Percent Happier tries to land somewhere more useful — a real conversation with someone who studies stress for a living, rather than another list of tips copied from the last ten articles on the subject.</p><h2>Who you're listening to</h2><p>Dr. Modupe Akinola is a professor at Columbia Business School whose research centers on stress and performance — how people actually function, and sometimes stop functioning well, under pressure, and what measurably changes that outcome. That background matters here: the conversation is anchored in what's been studied, not in received wisdom about what stress management is supposed to look like.</p><h2>Why a business school professor, on a mental health podcast</h2><p>Stress research doesn't live in one tidy field. A meaningful amount of it comes out of organizational and business psychology, because workplaces are where a huge share of adult stress is actually generated and studied — performance reviews, deadlines, difficult colleagues, the particular flavor of dread that comes from an unclear Slack message. Approaching stress through that lens tends to produce advice that's tested against real pressure, not just described in the abstract.</p><h2>What to expect</h2><p>Based on the episode's framing, expect a discussion of how stress actually affects thinking and decision-making under pressure, and where common assumptions about 'managing stress' — that it's purely bad, that avoiding it is the goal, that willpower is the main lever — don't hold up well against the research. Ten Percent Happier's format leans toward long-form, unhurried conversation rather than a tips listicle read aloud, so don't expect a bullet-pointed takeaway at the two-minute mark.</p><p>One honest caveat: the specifics of what's actually said are worth hearing directly rather than summarized secondhand. This writeup is a pointer toward a conversation worth your time, not a transcript or a stand-in for listening to it.</p><p><iframe style=\"border-radius:12px\" src=\"https://open.spotify.com/embed/episode/5IvwJBttwqfAgJspvpyB43?utm_source=generator\" width=\"100%\" height=\"232\" frameBorder=\"0\" allowfullscreen=\"\" allow=\"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture\" loading=\"lazy\"></iframe></p><h2>How to actually listen to this</h2><p>This is a full-length conversation, not a five-minute clip — it rewards a stretch where you can actually sit with it: a commute, a walk, folding laundry, anything that occupies your hands without needing your full attention. Splitting attention between this and, say, answering email tends to turn a genuinely useful conversation into background noise.</p><h2>If you want the short version first</h2><p>Long-form audio isn't for everyone, and that's fine — the video and guided breathing exercise elsewhere in this library cover the same ground (stress, the nervous system, what actually helps) in under five minutes each, if you want something immediately actionable before committing to a full episode.</p>"
}
```

---

## 4. Video — "A Guided Visualization to Help You Relax"

```json
{
  "title": "A Guided Visualization to Help You Relax",
  "description": "An NIMH clinical psychologist explains the brain's stress response, then leads a short guided visualization you can use the moment you feel wound up.",
  "category": "stress",
  "contentType": "Video",
  "thumbnail": "https://img.youtube.com/vi/Dq9odPtHbcg/hqdefault.jpg",
  "readTime": "6 min watch",
  "author": "Vedanshu",
  "published": true,
  "featured": false,
  "content": "<p>Most stress advice tells you what to do. This video spends a minute first on what's actually happening in your body when stress hits — because the guided exercise that follows works a lot better once you understand why it works.</p><h2>What's happening when you feel stressed</h2><p>Dr. Krystal Lewis, a clinical psychologist and researcher at the National Institute of Mental Health (NIMH), walks through the brain's fight-flight-freeze response in plain terms: a part of your brain built to react to physical danger doesn't distinguish well between a genuine threat and a stressful email. The body's response — faster heart rate, shallower breathing, tensed muscles — is the same either way.</p><h2>Why a visualization, specifically</h2><p>You can't talk your body out of a stress response with logic alone, because the response isn't a logical process to begin with. A guided visualization works differently: it gives your attention somewhere specific and calming to go, which gives the nervous system something concrete to settle around, rather than asking it to just 'stop.'</p><h2>What's in the video</h2><p><iframe width=\"100%\" height=\"315\" src=\"https://www.youtube.com/embed/Dq9odPtHbcg\" title=\"Guided Visualization: Dealing with Stress\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></p><p>The first few minutes cover the science briefly; the rest is Dr. Lewis guiding you through the visualization itself, so you can also just skip ahead and use it as a standalone exercise once you've watched it once.</p><h2>When to reach for this</h2><p>This works best used before you're at your worst — in the ten minutes after a hard meeting, not necessarily in the middle of a panic. Like any relaxation practice, it's more reliable with repetition than as a one-time fix.</p><p><em>Presented by Dr. Krystal Lewis, National Institute of Mental Health (NIMH).</em></p>"
}
```

## 5. Video — "GREAT: A Framework for Managing Stress and Anxiety"

```json
{
  "title": "GREAT: A Framework for Managing Stress and Anxiety",
  "description": "A simple, memorable framework from an NIMH psychologist for recognizing and working with everyday stress and anxiety before they build up.",
  "category": "mental-health",
  "contentType": "Video",
  "thumbnail": "https://img.youtube.com/vi/RIyge4jzeFg/hqdefault.jpg",
  "readTime": "8 min watch",
  "author": "Vedanshu",
  "published": true,
  "featured": false,
  "content": "<p>Most of us don't lack information about stress — we lack a simple way to remember what to actually do about it in the moment. That's what this framework is built to fix.</p><h2>The problem with most stress advice</h2><p>There's no shortage of tips for managing stress and anxiety, but a long list is hard to use under pressure, which is exactly when you'd want it. A short, memorable framework is more likely to actually get used than a comprehensive one.</p><h2>The GREAT framework</h2><p>In this video, Dr. Krystal Lewis — a clinical psychologist and researcher at the National Institute of Mental Health (NIMH) — introduces GREAT, a set of practices designed to be easy to recall and apply to everyday stress and anxiety, not just a clinical setting.</p><p><iframe width=\"100%\" height=\"315\" src=\"https://www.youtube.com/embed/RIyge4jzeFg\" title=\"GREAT: Helpful Practices to Manage Stress and Anxiety\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></p><h2>Why this pairs well with the guided visualization</h2><p>Where the guided visualization above is one specific exercise for one moment of stress, GREAT is a broader way of thinking about stress day to day — useful as a framework to return to, rather than a single technique.</p><p><em>Presented by Dr. Krystal Lewis, National Institute of Mental Health (NIMH). More at nimh.nih.gov/stressandanxiety.</em></p>"
}
```

**Both NIMH videos verified directly** (title, presenter, and NIMH channel ownership confirmed via web search) — these are genuine NIMH content, not fabricated.

### The 2 SAMHSA audio PSAs — not added, titles don't check out

You pasted two SAMHSA items: *"Can We Talk About Mental Health?"* and *"Mental Health Isn't Always Visible."* I checked both against SAMHSA's real PSA catalog before adding them, and I'm not adding either as described:

- **"Can We Talk About Mental Health?"** — the real SAMHSA PSA is titled **"Can We Talk?"** (not "...About Mental Health"), and it does have real, direct MP3 downloads — 30-second and 20-second versions, English and Spanish — hosted on samhsa.gov. So this one is real and has working audio, just under a different, more generic title than what was pasted to me.
- **"Mental Health Isn't Always Visible"** — I cannot find a SAMHSA PSA with this title anywhere. The closest real match is **"Can't Be Seen"**, from a different SAMHSA campaign page ("Mental Health Treatment Works"), not the page you were pointed to. I could not confirm a direct MP3 URL for that one either.

Both titles you were given look like paraphrases rather than the actual PSA names — a sign the content wasn't sourced directly from SAMHSA's site. I'm not adding either under the given titles. If you want these in, tell me and I'll rebuild them under the correct names with verified links, rather than publishing titles that don't match anything real.

---

## Code change shipped alongside these

`ResourceDetail.tsx` (line ~84): the format badge was reading `category` before `contentType`, so
every resource's badge showed its topic instead of its format. Fixed — `contentType` now takes
priority. These 3 are the first records where the badge will correctly read "Video" / "Audio" /
"Podcast". Uncommitted locally, same as the earlier assessment fixes — needs a commit + the Vercel
deploy to reach production.

## Still needs you

These exist only as this file. To actually appear in the app: paste each JSON into the admin
resource editor, or tell me to write them to the live database directly (same production-write
situation as the assessment repair — Cowork's safety classifier will likely ask for explicit
confirmation).
