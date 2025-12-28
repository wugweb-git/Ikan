import * as kv from "./kv_store.tsx";

// Sleep Tight Data
const sleepTightProgram = {
  equip_id: "sleep-tight-9",
  id: "sleep-tight-9",
  slug: "sleep-tight-9",
  title: "Sleep Tight",
  summary: "Guided self-help program. Identify disruptions. Build healthier sleep patterns.",
  description: "Guided self-help program. 18 days. Identify disruptions. Build healthier sleep patterns. Includes: 18-day structure; Sleep, mood, habit trackers; CBT-based techniques.",
  price: {
    currency: "INR",
    amount_cents: 99900, // 999.00
    payment_provider: "razorpay",
    one_time: true
  },
  currency: "INR",
  duration_days: 18,
  category: "SLEEP",
  tags: ["SLEEP", "ANXIETY", "CBT"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: "Published",
  hero_image: "https://images.unsplash.com/photo-1541781777621-39125221ab97?q=80&w=2000&auto=format&fit=crop",
  thumbnail: "https://images.unsplash.com/photo-1541781777621-39125221ab97?q=80&w=800&auto=format&fit=crop",
  
  // Structure details for Bento Grid mapping
  section1_title: "Is this for you?",
  section1_eligibility_title: "Sleep Tight may be helpful if:",
  section1_eligibility_points: [
    "You have trouble falling asleep or staying asleep",
    "You wake up too early and struggle to fall back asleep",
    "You find yourself worrying about your sleep",
    "Poor sleep is starting to affect your day-to-day life"
  ],
  section1_who_title: "Who can participate",
  section1_who_content: "This program is designed for adults who want to improve their sleep. If you’re managing other mental health concerns, consider checking with a qualified healthcare professional before starting.",
  
  section2_title: "Sleep Tight",
  section2_subtitle: "A guided program to improve sleep",
  section2_content: "Sleep Tight is a guided, self-help program designed to help you understand and improve your sleep. Over the next 18 days, you’ll identify factors that disrupt your sleep and gradually build healthier sleep patterns that support your well-being.",
  section2_bullets: [
    "A structured 18-day journey designed to fit into daily life",
    "Sleep, mood, and habit trackers to notice patterns and disruptions",
    "Science-backed techniques, including CBT"
  ],
  section2_image: "https://images.unsplash.com/photo-1511295742362-92c96b504802?q=80&w=2000&auto=format&fit=crop",
  section2_image_secondary: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
  
  section3_title: "How it works",
  section3_content: [
    "The program focuses on sleep in two stages.",
    "First, you’ll learn practical techniques to calm your mind and improve sleep hygiene.",
    "Then, you’ll build a personalized bedtime routine and practice these skills consistently.",
    "The focus is on habit-building — without medication or pressure — to support better rest over time."
  ],
  
  section4_benefits_title: "What you’ll gain",
  section4_benefits: [
    { title: "Understand your sleep better", description: "Notice patterns and identify factors affecting your sleep" },
    { title: "Manage sleep-related thoughts", description: "Learn ways to respond to worries that keep you awake" },
    { title: "Build sleep-friendly habits", description: "Create routines that support better rest" },
    { title: "Develop reusable tools", description: "Practice skills you can return to when sleep feels difficult" }
  ],
  section4_notes_title: "Important notes",
  section4_notes: [
    { title: "Consistency matters", description: "This is an 18-day program. Spending a few minutes daily helps reinforce skills." },
    { title: "This is a self-help tool", description: "The program focuses on building coping skills and does not claim to cure mental health conditions." },
    { title: "Support is always okay", description: "If you feel overwhelmed at any point, consider speaking with a mental health professional." }
  ]
};

export async function handleEquipCleanupAndSeed() {
  console.log("🧹 Starting Equip Program Cleanup & Seeding...");
  const logs = [];
  logs.push("Starting cleanup...");

  try {
    // 1. Get all equip programs
    const programs = await kv.getByPrefix("equip_program:");
    logs.push(`Found ${programs.length} programs to investigate.`);

    // 2. Delete all programs
    for (const p of programs) {
        // Handle various ID formats
        const id = p.equip_id || p.id;
        const slug = p.slug;
        
        if (id) {
            await kv.del(`equip_program:${id}`);
            logs.push(`Deleted ID key: equip_program:${id}`);
        }
        
        if (slug) {
            await kv.del(`equip_program:${slug}`);
            await kv.del(`equip_program_by_slug:${slug}`);
            logs.push(`Deleted Slug keys for: ${slug}`);
        }
    }
    
    // 3. Insert Sleep Tight
    logs.push("Seeding Sleep Tight program...");
    await kv.set(`equip_program:${sleepTightProgram.equip_id}`, sleepTightProgram);
    await kv.set(`equip_program_by_slug:${sleepTightProgram.slug}`, sleepTightProgram);
    
    logs.push("✅ Sleep Tight program seeded successfully.");
    console.log("✅ Cleanup complete.");
    
    return { success: true, logs, program: sleepTightProgram };
  } catch (error) {
    console.error("Cleanup failed:", error);
    return { success: false, error: String(error), logs };
  }
}
