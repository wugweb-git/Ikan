import svgPaths from "./svg-fuem4sp213";
import imgFrame1000007591 from "figma:asset/a3cbf0ed1fa23fd331aa7101cffe50c34eddc48b.png";
import imgEllipse92 from "figma:asset/aa6ea0d1bd053035ebab3da98f38617fc0067481.png";
import imgDtsFitnessAllieLehmanPhotosId1797CopyWebp from "figma:asset/091bde3ca3df1576f3a7dde8590aee20d6858d69.png";
import imgFireflyABeautifulKitchenCounterShotFromTheSideTheBacksplashIsLightGreenTileThereI1Jpg from "figma:asset/7ee423e6dc20937088d7d916d0f5ff333a101e26.png";
import imgDtsPleaseDoNotDisturbFanetteGuilloudPhotosId8854Webp from "figma:asset/69630877b2f0ea1979fedcdee430b8d92c705a78.png";
import { BlogSectionBlock } from "../components/blocks/BlogSectionBlock";
import { BlogHero } from "../components/blocks/BlogHero";
import { BlogContent } from "../components/blocks/BlogContent";
import { Badge } from "../components/ui/badge";
import { getLatestBlogPosts } from "../lib/sample-data/blog-posts";

function Frame1000007591() {
  return (
    <BlogHero
      title="What OpenAI's Research Reveals About The Future Of AI Search"
      description="New OpenAI research shows AI search has become ChatGPT's primary use case, with mass adoption projected for mid-2026."
      image={imgFrame1000007591}
      imageAlt="AI Search Technology"
    />
  );
}

function Frame1000007601() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <Frame1000007591 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#252525] text-[0px] w-[721.04px]">
        <p className="leading-[24px] mb-0 text-[16px]">
          <span>{`The `}</span>
          <a className="[text-underline-position:from-font] cursor-pointer decoration-solid font-['Ubuntu:Regular',_sans-serif] not-italic underline" href="https://www.searchenginejournal.com/history-of-chatgpt-timeline/488370/">
            <span className="[text-underline-position:from-font] decoration-solid leading-[24px]" href="https://www.searchenginejournal.com/history-of-chatgpt-timeline/488370/">
              launch of ChatGPT
            </span>
          </a>
          <span>{` in 2022 didn’t so much cause a shift in the search landscape as trigger a series of seismic events. And, like seismologists, the SEO industry needs data if it’s to predict future tremors and aftershocks – let alone prepare itself for what the landscape might reshape itself into once the ground has finally settled.`}</span>
        </p>
        <p className="leading-[24px] mb-0 text-[16px]">
          So, when OpenAI released a 65-page research paper on Sept. 15, 2025, titled “
          <a className="[text-underline-position:from-font] cursor-pointer decoration-solid font-['Ubuntu:Regular',_sans-serif] not-italic underline" href="https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf">
            <span className="[text-underline-position:from-font] decoration-solid leading-[24px]" href="https://cdn.openai.com/pdf/a253471f-8260-40c6-a2cc-aa93fe9f142e/economic-research-chatgpt-usage-paper.pdf">
              How People Use ChatGPT
            </span>
          </a>
          ,” some of us were understandably excited to finally have some authoritative usage data from inside a major large language model (LLM).
        </p>
        <p className="leading-[24px] mb-0 text-[16px]">Two key findings leap out:</p>
        <ol className="list-decimal mb-0" start="1">
          <li className="mb-0" style={{ marginInlineStart: "calc(1.5 * 1 * var(--list-marker-font-size, 0))" }}>
            <span className="leading-[24px] text-[16px]">We’re closer to mass adoption of AI than most probably realize.</span>
          </li>
          <li style={{ marginInlineStart: "calc(1.5 * 1 * var(--list-marker-font-size, 0))" }}>
            <span className="leading-[24px] text-[16px]">How users interact with ChatGPT has fundamentally shifted in the past year.</span>
          </li>
        </ol>
        <p className="leading-[24px] text-[16px]">For SEOs, this isn’t just another adoption study: It’s strategic intelligence about where AI search is heading.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center leading-[0] not-italic relative shrink-0 text-[#252525]" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[34px] w-[721.04px]">
        <p className="leading-[42px]">Mass Adoption Is Closer Than You Think</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] min-w-full relative shrink-0 text-[16px]" style={{ width: "min-content" }}>
        <p className="mb-0">{`How close is ChatGPT to the tipping point where it will accelerate into mass adoption? `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Developed by sociologist Everett Rogers, the diffusion of innovation theory provides us with a useful framework to explain how new technologies spread through society in predictable stages. First, there are the innovators, accounting for 2.5% of the market. Then, the early adopters come along (13.5%), to be followed by the early majority (34%). At this point, ~50% of the potential market has adopted the technology. Anyone jumping on board after this point can safely be described as either the late majority (34%), or laggards (16%). `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`The tipping point happens at around 20%, when the new technology is no longer confined to innovators or early adopters but is gradually taken up by the early majority. It’s at this point that mainstream adoption accelerates rapidly. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Now, let’s apply this to ChatGPT’s data. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Since launching in late 2022, ChatGPT’s growth has been staggering. The new report reveals that, in the five-month period from February to July 2025, ChatGPT grew from 400 million to 700 million weekly active users (WAU), sending 18 billion messages per week. That represents an average compound growth of roughly 11-12% month-over-month. `}</p>
        <p className="mb-0"> </p>
        <p>700 million WAU is equivalent to around 10% of the global adult population; impressive, but not quite mass adoption. Yet.</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center justify-center leading-[0] not-italic relative shrink-0 text-[#252525]" data-name="Container">
      <div className="flex flex-col font-['Ubuntu:Bold',_sans-serif] justify-center relative shrink-0 text-[34px] w-[721.04px]">
        <p className="leading-[42px]">The Behavioral Revolution Hiding In Plain Sight</p>
      </div>
      <div className="flex flex-col font-['Ubuntu:Regular',_sans-serif] justify-center leading-[24px] min-w-full relative shrink-0 text-[16px]" style={{ width: "min-content" }}>
        <p className="mb-0">{`Buried within OpenAI’s usage data is perhaps the most significant finding for search marketers: a fundamental shift in how people are using AI tools. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`In June 2024, non-work messages accounted for 53% of all ChatGPT interactions. By June 2025, this figure had climbed to 73%. This is a clear signal that ChatGPT is moving from workplace tool to everyday utility. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Things get even more interesting when we look at the intent behind those queries. OpenAI categorizes user interactions into three types: `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Asking (seeking information and guidance). `}</p>
        <p className="mb-0">{`Doing (generating content or completing tasks). `}</p>
        <p className="mb-0">{`Expressing (sharing thoughts or feelings with no clear intent). `}</p>
        <p className="mb-0">{`The data reveals that “Asking” now makes up 51.6% of all interactions, compared to 34.6% for “Doing” and 13.8% for “Expressing.” `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Let’s be clear: What ChatGPT categorizes as “Asking” is pretty much synonymous with what we think of as AI search. These are the queries that were once the exclusive domain of search engines. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Users are also increasingly satisfied with the quality of responses to “Asking” queries, rating interactions as either Good or Bad at a ratio of 4.45:1. For “Doing” interactions, the ratio of Good to Bad drops to 2.76. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`The trend becomes even clearer when we break down interactions by topic. Three topics account for just under 78% of all messages. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`Practical Guidance (29%). `}</p>
        <p className="mb-0">{`Seeking Information (24%). `}</p>
        <p className="mb-0">{`Writing (24%). `}</p>
        <p className="mb-0">{`These figures are even more noteworthy when you consider that, in July 2024, “Writing” was easily the most common topic (36%), dropping 12 percentiles in just one year. `}</p>
        <p className="mb-0"> </p>
        <p className="mb-0">{`And while “Practical Guidance” has remained steady at 29%, “Seeking Information” has shot up 10 percentiles from 14%. What a difference a year makes. `}</p>
        <p className="mb-0"> </p>
        <p>And while “Writing” still accounts for 42% of all work-related messages, the nature of these requests has shifted. Instead of generating content from scratch, two-thirds of writing requests now focus on editing, translating, or summarizing text supplied by the user.</p>
      </div>
    </div>
  );
}

function Frame1000007590() {
  const articleContent = (
    <>
      <Container />
      <Container1 />
      <Container2 />
    </>
  );

  return (
    <BlogContent
      content={articleContent}
      author={{
        name: "Reza Moaiandin",
        avatar: imgEllipse92,
        date: "September 30, 2025",
        readTime: "10 min read"
      }}
      tags={['UI Design', 'Marketing', 'Ai Driven', 'Strategy']}
      onTagClick={(tag) => console.log('Tag clicked:', tag)}
      onShare={() => console.log('Share clicked')}
    />
  );
}

function Section3({ onBlogClick, onViewAll }: { 
  onBlogClick?: (blogId: string) => void;
  onViewAll?: () => void;
} = {}) {
  const blogPosts = getLatestBlogPosts(3);
  
  const handlePostClick = (post: any) => {
    if (onBlogClick) {
      onBlogClick(post.id);
    }
  };

  return (
    <BlogSectionBlock 
      posts={blogPosts}
      onPostClick={handlePostClick}
      onViewAll={onViewAll}
    />
  );
}

export default function BlogArtlcePage() {
  return (
    <div className="bg-[#e9ebef] content-stretch flex flex-col items-start justify-center relative size-full" data-name="Blog_Artlce_Page">
      <Frame1000007601 />
      <Frame1000007590 />
      <Section3 />
    </div>
  );
}