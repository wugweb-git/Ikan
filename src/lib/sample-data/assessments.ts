export const assessmentsData = {
  "assessments": [
    {
      "assessment_id": "assess-general-health",
      "id": "00000000-0000-0000-0000-000000000001",
      "slug": "general-health",
      "title": "Unsure or general concern.",
      "description": "Your Personal Compass: This quick initial check combines key elements of anxiety (GAD-2), depression (PHQ-2), and well-being (WHO-5) with measures of your resilience and self-efficacy, giving you a comprehensive emotional health overview.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 5,
        "category": "General",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 25],
          "interpretation": {
            "0-13": "Poor wellbeing - Consider seeking support.",
            "14-18": "Below average wellbeing - Some areas need attention.",
            "19-25": "Good wellbeing - Maintain current positive practices."
          }
        }
      },
      "questions": [
        {
          "question_id": "g1",
          "id": "g1",
          "order": 1,
          "text": "I have felt cheerful and in good spirits",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you felt cheerful and in good spirits?",
          "required": true,
          "options": [
            { "id": "0", "label": "At no time", "value": 0, "score": 0 },
            { "id": "1", "label": "Some of the time", "value": 1, "score": 1 },
            { "id": "2", "label": "Less than half the time", "value": 2, "score": 2 },
            { "id": "3", "label": "More than half the time", "value": 3, "score": 3 },
            { "id": "4", "label": "Most of the time", "value": 4, "score": 4 },
            { "id": "5", "label": "All of the time", "value": 5, "score": 5 }
          ]
        },
        {
          "question_id": "g2",
          "id": "g2",
          "order": 2,
          "text": "I have felt calm and relaxed",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you felt calm and relaxed?",
          "required": true,
          "options": [
            { "id": "0", "label": "At no time", "value": 0, "score": 0 },
            { "id": "1", "label": "Some of the time", "value": 1, "score": 1 },
            { "id": "2", "label": "Less than half the time", "value": 2, "score": 2 },
            { "id": "3", "label": "More than half the time", "value": 3, "score": 3 },
            { "id": "4", "label": "Most of the time", "value": 4, "score": 4 },
            { "id": "5", "label": "All of the time", "value": 5, "score": 5 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-anxiety-gad7",
      "id": "00000000-0000-0000-0000-000000000002",
      "slug": "anxiety",
      "title": "Feeling overwhelmed and anxious.",
      "description": "Tune into your worries: This 7-question check helps you score how often anxiety has been buzzing over the last two weeks, giving you clear facts for your doctor.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 2,
        "category": "Anxiety",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 21],
          "interpretation": {
            "0-4": "Minimal - No significant anxiety symptoms.",
            "5-9": "Mild - Monitor symptoms; consider self-care strategies.",
            "10-14": "Moderate - Consider professional support and intervention.",
            "15-21": "Severe - Strongly recommend professional evaluation and treatment."
          }
        }
      },
      "questions": [
        {
          "question_id": "q1",
          "id": "q1",
          "order": 1,
          "text": "Feeling nervous, anxious, or on edge",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
          "required": true,
          "options": [
            { "id": "0", "label": "Not at all", "value": 0, "score": 0 },
            { "id": "1", "label": "Several days", "value": 1, "score": 1 },
            { "id": "2", "label": "More than half the days", "value": 2, "score": 2 },
            { "id": "3", "label": "Nearly every day", "value": 3, "score": 3 }
          ]
        },
        {
          "question_id": "q2",
          "id": "q2",
          "order": 2,
          "text": "Not being able to stop or control worrying",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
          "required": true,
          "options": [
            { "id": "0", "label": "Not at all", "value": 0, "score": 0 },
            { "id": "1", "label": "Several days", "value": 1, "score": 1 },
            { "id": "2", "label": "More than half the days", "value": 2, "score": 2 },
            { "id": "3", "label": "Nearly every day", "value": 3, "score": 3 }
          ]
        },
        {
          "question_id": "q3",
          "id": "q3",
          "order": 3,
          "text": "Worrying too much about different things",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you been bothered by worrying too much about different things?",
          "required": true,
          "options": [
            { "id": "0", "label": "Not at all", "value": 0, "score": 0 },
            { "id": "1", "label": "Several days", "value": 1, "score": 1 },
            { "id": "2", "label": "More than half the days", "value": 2, "score": 2 },
            { "id": "3", "label": "Nearly every day", "value": 3, "score": 3 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-depression-phq9",
      "id": "00000000-0000-0000-0000-000000000003",
      "slug": "depression",
      "title": "Feeling depressed and hopeless.",
      "description": "Check your emotional forecast: Use this 9-question reflection to see how frequently depressive moods have affected your life lately, paving the way for helpful conversations.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 3,
        "category": "Depression",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 27],
          "interpretation": {
            "0-4": "Minimal - No depression; encourage healthy lifestyle.",
            "5-9": "Mild - Monitor; suggest self-care and re-screen in 2 weeks.",
            "10-14": "Moderate - Offer self-help + professional support.",
            "15-19": "Moderately severe - Strongly consider active treatment.",
            "20-27": "Severe - Immediate treatment and professional evaluation."
          }
        }
      },
      "questions": [
        {
          "question_id": "q1",
          "id": "q1",
          "order": 1,
          "text": "Little interest or pleasure in doing things",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
          "required": true,
          "options": [
            { "id": "0", "label": "Not at all", "value": 0, "score": 0 },
            { "id": "1", "label": "Several days", "value": 1, "score": 1 },
            { "id": "2", "label": "More than half the days", "value": 2, "score": 2 },
            { "id": "3", "label": "Nearly every day", "value": 3, "score": 3 }
          ]
        },
        {
          "question_id": "q2",
          "id": "q2",
          "order": 2,
          "text": "Feeling down, depressed, or hopeless",
          "type": "scale",
          "prompt": "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
          "required": true,
          "options": [
            { "id": "0", "label": "Not at all", "value": 0, "score": 0 },
            { "id": "1", "label": "Several days", "value": 1, "score": 1 },
            { "id": "2", "label": "More than half the days", "value": 2, "score": 2 },
            { "id": "3", "label": "Nearly every day", "value": 3, "score": 3 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-stress",
      "id": "00000000-0000-0000-0000-000000000004",
      "slug": "stress",
      "title": "Feeling worried and stressed.",
      "description": "Measure your control level: Quickly gauge your stress over the past month by focusing on your feelings—did you feel overwhelmed or mostly in charge of things?",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 3,
        "category": "Stress",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 40],
          "interpretation": {
            "0-13": "Low stress - You are coping well.",
            "14-26": "Moderate stress - Consider stress management techniques.",
            "27-40": "High perceived stress - Consider professional support."
          }
        }
      },
      "questions": [
        {
          "question_id": "s1",
          "id": "s1",
          "order": 1,
          "text": "In the last month, how often have you felt that you were unable to control the important things in your life?",
          "type": "scale",
          "prompt": "In the last month, how often have you felt that you were unable to control the important things in your life?",
          "required": true,
          "options": [
            { "id": "0", "label": "Never", "value": 0, "score": 0 },
            { "id": "1", "label": "Almost never", "value": 1, "score": 1 },
            { "id": "2", "label": "Sometimes", "value": 2, "score": 2 },
            { "id": "3", "label": "Fairly often", "value": 3, "score": 3 },
            { "id": "4", "label": "Very often", "value": 4, "score": 4 }
          ]
        },
        {
          "question_id": "s2",
          "id": "s2",
          "order": 2,
          "text": "In the last month, how often have you felt confident about your ability to handle your personal problems?",
          "type": "scale",
          "prompt": "In the last month, how often have you felt confident about your ability to handle your personal problems?",
          "required": true,
          "options": [
            { "id": "0", "label": "Never", "value": 0, "score": 4 },
            { "id": "1", "label": "Almost never", "value": 1, "score": 3 },
            { "id": "2", "label": "Sometimes", "value": 2, "score": 2 },
            { "id": "3", "label": "Fairly often", "value": 3, "score": 1 },
            { "id": "4", "label": "Very often", "value": 4, "score": 0 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-burnout-risk",
      "id": "00000000-0000-0000-0000-000000000005",
      "slug": "burnout",
      "title": "Feeling drained and burned out.",
      "description": "Unmask your burnout: This tool identifies that heavy exhaustion and mental distance you might be feeling, which is the vital first step toward reclaiming your energy.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 4,
        "category": "Burnout",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 30],
          "interpretation": {
            "0-10": "Low risk - Healthy work-life balance maintained.",
            "11-20": "Moderate risk - Monitor stress levels and consider preventive measures.",
            "21-30": "High risk - Immediate attention needed; consider professional support."
          }
        }
      },
      "questions": [
        {
          "question_id": "b1",
          "id": "b1",
          "order": 1,
          "text": "I feel emotionally drained by my work",
          "type": "scale",
          "prompt": "How often do you feel emotionally drained by your work?",
          "required": true,
          "options": [
            { "id": "0", "label": "Never", "value": 0, "score": 0 },
            { "id": "1", "label": "Rarely", "value": 1, "score": 1 },
            { "id": "2", "label": "Sometimes", "value": 2, "score": 2 },
            { "id": "3", "label": "Often", "value": 3, "score": 3 },
            { "id": "4", "label": "Always", "value": 4, "score": 4 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-sleep-quality",
      "id": "00000000-0000-0000-0000-000000000006",
      "slug": "sleep",
      "title": "Struggling with quality sleep.",
      "description": "Get the scoop on your sleep: This quick 8-question check-in illuminates your night-time patterns and tells you if symptoms of insomnia might be affecting your rest.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 3,
        "category": "Sleep Condition Indicator",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 20],
          "interpretation": {
            "0-7": "Good sleep quality - Maintain current sleep habits.",
            "8-14": "Fair sleep quality - Consider improving sleep hygiene.",
            "15-20": "Poor sleep quality - Recommend professional evaluation."
          }
        }
      },
      "questions": [
        {
          "question_id": "s1",
          "id": "s1",
          "order": 1,
          "text": "How often do you have trouble falling asleep?",
          "type": "scale",
          "prompt": "In the past month, how often have you had trouble falling asleep?",
          "required": true,
          "options": [
            { "id": "0", "label": "Never", "value": 0, "score": 0 },
            { "id": "1", "label": "Rarely", "value": 1, "score": 1 },
            { "id": "2", "label": "Sometimes", "value": 2, "score": 2 },
            { "id": "3", "label": "Often", "value": 3, "score": 3 },
            { "id": "4", "label": "Always", "value": 4, "score": 4 }
          ]
        }
      ]
    },
    {
      "assessment_id": "assess-work-life",
      "id": "00000000-0000-0000-0000-000000000007",
      "slug": "work-life",
      "title": "Struggling to balance life.",
      "description": "Pinpoint your job stress hot-spots: Find out exactly which factors at work(from workload to support) are turning up the pressure on you.",
      "version": "1.0",
      "metadata": {
        "estimated_minutes": 3,
        "category": "Worklife Balance",
        "allow_repeat_days": 30,
        "created_at": "2025-09-18T00:00:00Z",
        "scoring": {
          "method": "sum",
          "type": "sum",
          "range": [0, 20],
          "interpretation": {
            "0-7": "Low stress - Healthy work-life balance.",
            "8-14": "Moderate stress - Room for improvement.",
            "15-20": "High stress - Consider discussing workload."
          }
        }
      },
      "questions": [
        {
          "question_id": "w1",
          "id": "w1",
          "order": 1,
          "text": "I feel my work interferes with my personal life",
          "type": "scale",
          "prompt": "How often do you feel your work interferes with your personal life?",
          "required": true,
          "options": [
            { "id": "0", "label": "Never", "value": 0, "score": 0 },
            { "id": "1", "label": "Rarely", "value": 1, "score": 1 },
            { "id": "2", "label": "Sometimes", "value": 2, "score": 2 },
            { "id": "3", "label": "Often", "value": 3, "score": 3 },
            { "id": "4", "label": "Always", "value": 4, "score": 4 }
          ]
        }
      ]
    }
  ]
};

export default assessmentsData;