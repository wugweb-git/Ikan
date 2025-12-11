export const equipProgramsData = {
  "equip_programs": [
    {
      "equip_id": "equip-sleep-well-28",
      "id": "00000000-0000-0000-0000-000000000013",
      "slug": "sleep-well",
      "title": "Online Sleep Program",
      "summary": "Enroll in our sleep training to finally put an end to restless nights and wake up feeling consistently refreshed.",
      "description": "Enroll in our sleep training to finally put an end to restless nights and wake up feeling consistently refreshed. Based on cognitive behavioral therapy for insomnia (CBT-I) principles, this 28-day program helps you optimize your sleep environment, develop healthy sleep routines, and address racing thoughts.",
      "price": {
        "currency": "INR",
        "amount_cents": 500000,
        "payment_provider": "razorpay",
        "one_time": true
      },
      "duration_days": 28,
      "expiry_days_after_purchase": 120,
      "onboarding": {
        "required_fields": [
          {"key": "sleep_quality", "type": "select", "options": ["poor","fair","good"], "required": true},
          {"key": "average_sleep_hours", "type": "number", "required": true},
          {"key": "sleep_difficulties", "type": "multiselect", "options": ["falling_asleep","staying_asleep","early_waking","restless_sleep"], "required": true}
        ]
      },
      "structure": {
        "unlock_rule": "sequential_previous_completed",
        "daily_check_in_time": "21:00",
        "reminder_rules": [
          {"id": "remind_daily", "offset": "21:00", "channels": ["push"], "active": true}
        ]
      },
      "days": [
        {
          "day": 1,
          "title": "Sleep Science Basics",
          "type": "lesson",
          "content": [
            {"kind": "text", "body": "Learn about sleep cycles, circadian rhythms, and sleep's role in mental health."},
            {"kind": "activity", "id": "d1_sleep_diary", "title": "Sleep diary setup", "instructions": "Begin tracking your sleep patterns and quality."}
          ],
          "required": true,
          "estimated_min": 15
        }
      ],
      "meta": {
        "created_by": "seed_v1",
        "created_at": "2025-09-18T00:00:00Z",
        "version": "1.0",
        "category": "sleep",
        "tags": ["Sleep", "insomnia", "rest", "sleep hygiene", "CBT-I"]
      },
      "tags": ["Sleep", "insomnia", "rest", "mental health"],
      "created_at": "2025-09-18T00:00:00Z"
    },
    {
      "equip_id": "equip-stress-30",
      "id": "00000000-0000-0000-0000-000000000011",
      "slug": "stress",
      "title": "Practical Stress Relief",
      "summary": "Defend your inner peace: implement practical stress reduction strategies for an overwhelmed or anxious mind.",
      "description": "Defend your inner peace: implement practical stress reduction strategies for an overwhelmed or anxious mind. Learn evidence-based stress management strategies including mindfulness, cognitive reframing, and relaxation techniques.",
      "price": {
        "currency": "INR",
        "amount_cents": 500000,
        "payment_provider": "razorpay",
        "one_time": true
      },
      "duration_days": 30,
      "expiry_days_after_purchase": 180,
      "onboarding": {
        "required_fields": [
          {"key": "stress_level", "type": "select", "options": ["low","moderate","high"], "required": true},
          {"key": "main_stress_sources", "type": "multiselect", "options": ["work","relationships","health","finances","other"], "required": true},
          {"key": "current_coping_methods", "type": "text", "required": false}
        ]
      },
      "structure": {
        "unlock_rule": "sequential_previous_completed",
        "daily_check_in_time": "19:00",
        "reminder_rules": [
          {"id": "remind_daily", "offset": "19:00", "channels": ["push","email"], "active": true}
        ]
      },
      "days": [
        {
          "day": 1,
          "title": "Understanding Your Stress",
          "type": "lesson",
          "content": [
            {"kind": "text", "body": "Identify your unique stress patterns and triggers."},
            {"kind": "activity", "id": "d1_stress_mapping", "title": "Stress mapping", "instructions": "Track your stress levels throughout the day."}
          ],
          "required": true,
          "estimated_min": 15
        }
      ],
      "meta": {
        "created_by": "seed_v1",
        "created_at": "2025-09-18T00:00:00Z",
        "version": "1.0",
        "category": "stress",
        "tags": ["Stress", "management", "mindfulness", "resilience", "coping"]
      },
      "tags": ["Stress", "management", "mental health", "mindfulness"],
      "created_at": "2025-09-18T00:00:00Z"
    },
    {
      "equip_id": "equip-unburn-32",
      "id": "00000000-0000-0000-0000-000000000010",
      "slug": "unburn",
      "title": "Defeat Burnout Now:",
      "summary": "The constant pressure has led to exhaustion. Rebuild your lost motivation and restore your life balance with Unburn.",
      "description": "The constant pressure has led to exhaustion. Rebuild your lost motivation and restore your life balance with Unburn. This evidence-based 32-day program combines cognitive behavioral techniques with mindfulness practices.",
      "price": {
        "currency": "INR",
        "amount_cents": 500000,
        "payment_provider": "razorpay",
        "one_time": true
      },
      "duration_days": 32,
      "expiry_days_after_purchase": 180,
      "onboarding": {
        "required_fields": [
          {"key": "current_burnout_level", "type": "select", "options": ["low","moderate","high"], "required": true},
          {"key": "work_hours_per_week", "type": "number", "required": true},
          {"key": "sleep_hours_avg", "type": "number", "required": true},
          {"key": "stress_triggers", "type": "text", "required": false}
        ]
      },
      "structure": {
        "unlock_rule": "sequential_previous_completed",
        "daily_check_in_time": "20:00",
        "reminder_rules": [
          {"id": "remind_daily", "offset": "20:00", "channels": ["push","email"], "active": true},
          {"id": "midnight_locked_reminder", "offset": "00:00", "channels": ["push"], "active": true, "note": "If previous day incomplete, notify."}
        ]
      },
      "days": [
        {
          "day": 1,
          "title": "Introduction to Burnout",
          "type": "lesson",
          "content": [
            {"kind": "text", "body": "Learn what burnout is, its signs, and how this program will guide recovery."},
            {"kind": "activity", "id": "d1_reflect", "title": "Self-reflection", "instructions": "Write 3 moments recently when you felt most drained."}
          ],
          "required": true,
          "estimated_min": 10
        },
        {
          "day": 2,
          "title": "Sleep Hygiene Basics",
          "type": "practice",
          "content": [
            {"kind": "text", "body": "Sleep is foundational to recovery. Learn basic hygiene rules."},
            {"kind": "challenge", "id": "d2_sleep", "title": "Wind-down routine", "instructions": "Tonight, stop screen use 30 minutes before bed and record your experience."}
          ],
          "required": true,
          "estimated_min": 12
        }
      ],
      "meta": {
        "created_by": "seed_v1",
        "created_at": "2025-09-18T00:00:00Z",
        "version": "1.0",
        "category": "recovery",
        "tags": ["Burnout", "recovery", "resilience", "workplace", "stress-management"]
      },
      "tags": ["Burnout", "recovery", "mental health", "stress"],
      "created_at": "2025-09-18T00:00:00Z"
    }
  ]
};

export default equipProgramsData;