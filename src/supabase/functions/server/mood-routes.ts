import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

export function registerMoodRoutes(app: Hono, middleware: any) {
  // GET /moods
  app.get("/moods", middleware, async (c) => {
    // Return default moods
    // In a real app, these might come from the database
    const moods = [
        { id: '1', value: 1, label: 'Angry', emoji: '😡', color: '#F97316', order: 1, is_active: true },
        { id: '2', value: 2, label: 'Upset', emoji: '😢', color: '#3B82F6', order: 2, is_active: true },
        { id: '3', value: 3, label: 'Sad', emoji: '😔', color: '#6B7280', order: 3, is_active: true },
        { id: '4', value: 4, label: 'Good', emoji: '😊', color: '#EAB308', order: 4, is_active: true },
        { id: '5', value: 5, label: 'Great', emoji: '😄', color: '#22C55E', order: 5, is_active: true }
    ];
    return c.json({ moods });
  });

  // GET /user/journal
  app.get("/user/journal", middleware, async (c) => {
    try {
        const userId = c.get('userId');
        const limit = Number(c.req.query('limit')) || 50;
        
        // Fetch entries
        const entries = await kv.getByPrefix(`journal_by_user:${userId}:`);
        
        // Sort by date descending (newest first)
        const sorted = entries.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        return c.json({ entries: sorted.slice(0, limit) });
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return c.json({ error: "Failed to fetch journal entries" }, 500);
    }
  });

  // POST /user/journal
  app.post("/user/journal", middleware, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();
        const { date, mood_rating, freehand_text_content, emotions, energy } = body;
        
        if (!date || mood_rating === undefined) {
            return c.json({ error: 'Date and mood rating are required' }, 400);
        }

        const id = crypto.randomUUID();
        const entry = {
            id,
            journal_entry_id: id, // For compatibility
            user_id: userId,
            date,
            mood_rating,
            freehand_text_content,
            emotions: emotions || [],
            energy: energy || 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Store by ID for direct access
        await kv.set(`journal:${id}`, entry);
        
        // Store by User+Date for list retrieval
        // This overwrites if multiple entries per day? 
        // Frontend logic seems to assume one entry per day ("How are you feeling today?")
        await kv.set(`journal_by_user:${userId}:${date}`, entry);
        
        return c.json({ entry });
    } catch (error) {
        console.error("Error creating journal entry:", error);
        return c.json({ error: "Failed to create journal entry" }, 500);
    }
  });
}
