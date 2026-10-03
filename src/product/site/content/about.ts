/**
 * THE ABOUT PAGE'S CONTENT — the one copy of it.
 *
 * This text existed twice: inline in `cms-defaults.ts` under `page-about-us`,
 * and again in iKAN 2's `src/lib/content/pages.json`, whose own header records
 * that it was "copied from the site's built-in page content
 * (src/utils/cms-defaults.ts)". A hand copy with nothing linking the two ends,
 * so the first edit on either side would have silently split them — and the
 * two renderings had already drifted ("Get Started" vs "Get started", and the
 * site shouting `OUR STORY` where the app says `Our Story`).
 *
 * So the object moves here and both ends derive from it:
 *
 *   about.ts  ─┬─>  AboutUs.tsx            the site renders this directly
 *              └─>  scripts/sync-about.mjs  emits iKAN 2's shape
 *
 * It is NOT in `cms-defaults.ts`. The old `page-about-us` entry there was a
 * JSON-stringified copy that `AboutUs.tsx` parsed back out at render — a round
 * trip through a string that bought nothing, since `usePageContent` and its
 * `/cms/pages/{pageId}` fetch were unwired in `c1bb553b` and no KV record has
 * overridden page copy since. Typed object in, typed object out.
 *
 * `howItWorks` and `whoFor` were never in `cms-defaults.ts` — the site built
 * them from the homepage's `HowItWorksSection` and `BenefitsSection`, while
 * iKAN 2 transcribed them off the live page. They are content, so they live
 * here now and both ends read the same words.
 *
 * ANGLE BRACKETS ARE A HIGHLIGHT MARKER, not markup. `Born from <personal>
 * experience` renders "personal" in the brand teal on the site; iKAN 2 strips
 * the brackets. Keep them in the source — they carry the author's intent, and
 * each end decides what to do with it. Never put real HTML in these strings:
 * they are rendered as text, and `unmark` only removes the brackets.
 */

export type AboutTitled = { title: string; tagline: string; description: string };

export type AboutPageContent = {
  hero: { title: string; subtitle: string };
  story: {
    label: string;
    heading: string;
    headingHighlightColor: string;
    paragraphs: string[];
    image: string;
    imageAlt: string;
  };
  mission: { label: string; title: string; description: string };
  vision: { label: string; title: string; description: string };
  valuesHeading: string;
  values: { iconName: string; title: string; description: string; color: string }[];
  howItWorks: { heading: string; steps: AboutTitled[] };
  whoFor: { heading: string; groups: AboutTitled[] };
  teamHeading: string;
  teamDescription: string;
  founders: { name: string; role: string; bio: string; image: string }[];
  team: { name: string; role: string; image: string }[];
};

/** Strip the highlight markers, for anywhere that renders the string plain. */
export const unmark = (s: string): string => s.replace(/[<>]/g, '');

/**
 * Split a marked string into runs, so a renderer can tint the marked ones.
 * `Born from <personal> experience` → [{text:'Born from ',mark:false}, …]
 */
export function marked(s: string): { text: string; mark: boolean }[] {
  const out: { text: string; mark: boolean }[] = [];
  const re = /<([^<>]*)>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ text: s.slice(last, m.index), mark: false });
    out.push({ text: m[1], mark: true });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), mark: false });
  return out;
}

export const ABOUT_PAGE: AboutPageContent = {
  hero: {
    title: 'To us, mental health matters.',
    subtitle: 'At iKAN, we believe mental health is for everyone.',
  },
  story: {
    label: 'Our Story',
    heading: 'Born from <personal> experience',
    headingHighlightColor: 'var(--ikan-brand-teal)',
    paragraphs: [
      'At some point everyone has struggled. Decades old friends Sachin, Vedanshu and Kartik have also faced their share of struggles, each one of us embarking on a personal journey to understand what we were going through. All of us witnessed first hand the barriers and gaps in mental healthcare in India and realised that the system is broken.',
      'Conversations with people who had struggled and therapists who had learned mental healthcare is inaccessible, costly, episodic, fragmented and needs to be fixed. We realised mental healthcare needs to stop being treated as a blackbox. The only way forward is by bringing people and technology together while being open and transparent. So we created <iKAN>.',
    ],
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    imageAlt: 'Founders collaborating on iKAN',
  },
  mission: {
    label: 'Mission',
    title:
      'Making mental health care accessible, affordable, and stigma-free for every individual in India.',
    description:
      'We are on a mission to bridge the gap between people and quality mental health support — through technology, compassion, and transparency.',
  },
  vision: {
    label: 'Vision',
    title: 'A world where seeking mental health support is as natural as visiting a doctor.',
    description:
      'We envision a future where mental wellness is normalised, people have the tools they need at their fingertips, and no one suffers in silence.',
  },
  valuesHeading: "Why you'll love iKAN",
  values: [
    {
      iconName: 'heart',
      title: 'People Centric',
      description:
        'At iKAN we keep you at the heart of everything, our sole focus is to empower you and make mental health care accessible for all.',
      color: 'var(--ikan-brand-teal)',
    },
    {
      iconName: 'shield',
      title: 'Secure',
      description:
        'We value your privacy very highly, we are committed to ensuring your data is always safe and secure.',
      color: 'var(--ikan-brand-amber)',
    },
    {
      iconName: 'flask-conical',
      title: 'Science Backed',
      description:
        'Everything we do is backed by research and validated by practising psychologists.',
      color: 'var(--ikan-brand-coral)',
    },
    {
      iconName: 'handshake',
      title: 'Our Promise',
      description:
        'We believe mental health care is for everyone and we are eager to make it a reality.',
      color: 'var(--ikan-brand-slate)',
    },
  ],
  howItWorks: {
    heading: 'How it works',
    steps: [
      {
        title: 'Take an Assessment',
        tagline: 'Understand where you are.',
        description:
          'Answer a few simple, clinically backed questions. Our assessments help you understand your emotional well-being — privately, at your own pace.',
      },
      {
        title: 'Connect with a Professional',
        tagline: 'Find the right support for you.',
        description:
          'Browse therapists, psychiatrists, and counselors. Pick your preferred language, session mode, and availability — we handle the rest.',
      },
      {
        title: 'Build Daily Habits',
        tagline: 'Make wellness your ritual.',
        description:
          'Join an Equip program with self-paced modules. Track your mood, practice mindfulness, and build lasting habits — one day at a time.',
      },
    ],
  },
  whoFor: {
    heading: 'Who is it for',
    groups: [
      {
        title: 'For Individuals',
        tagline: 'Your mental wellness, your pace.',
        description:
          'Access self-guided programs, mood journaling, and professional consultations — all in a private, stigma-free space designed around your comfort.',
      },
      {
        title: 'For Organizations',
        tagline: 'Invest in your people.',
        description:
          'Bring mental wellness into the workplace. Equip your teams with assessments, curated programs, and professional support that scales with your organization.',
      },
      {
        title: 'For Healthcare Providers',
        tagline: 'Extend care beyond the clinic.',
        description:
          'Use clinically validated assessments, track patient progress, and recommend structured programs — all on a platform built with privacy at its core.',
      },
    ],
  },
  teamHeading: 'Our Team',
  teamDescription:
    'The people behind iKAN, driven by personal experience and a shared belief that mental health care should be better.',
  founders: [
    {
      name: 'Kartik Chandra',
      role: 'Co-Founder and CEO',
      bio: 'Kartik has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKAN for growth and long term success.',
      image: '/team/kartik.jpg',
    },
    {
      name: 'Vedanshu Srivastava',
      role: 'Co-Founder and Product Head',
      bio: 'Vedanshu has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKAN for growth and long term success.',
      image: '/team/vedanshu.jpg',
    },
    {
      name: 'Sachin Vaishampayan',
      role: 'Co-Founder and CTO',
      bio: 'Sachin has worked in research and education for over a decade, leading and managing internationally funded projects across diverse landscapes. He has extensive experience in content creation and designing engaging learning modules, which he blends with his personal interest in developing mental health aids for growth and innovation at iKAN.',
      image: '/team/sachin.jpg',
    },
  ],
  team: [
    { name: 'Vaibhav Shukla', role: 'System Architect', image: '/team/vaibhav.jpg' },
    { name: 'Amitabh Bhatnagar', role: 'Dev Engineer', image: '/team/amitabh.jpg' },
    { name: 'Divyanshu Pundir', role: 'UX Designer', image: '/team/divyanshu.jpg' },
  ],
};
