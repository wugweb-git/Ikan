export const DEFAULT_ASSESSMENTS = [
    {
        id: 'phq-9',
        title: 'PHQ-9 Depression Scale',
        description: 'A brief assessment to help monitor severity of depression.',
        type: 'depression',
        questions: [
            { id: 'q1', text: 'Little interest or pleasure in doing things', type: 'scale', min: 0, max: 3 },
            { id: 'q2', text: 'Feeling down, depressed, or hopeless', type: 'scale', min: 0, max: 3 },
            { id: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much', type: 'scale', min: 0, max: 3 },
            { id: 'q4', text: 'Feeling tired or having little energy', type: 'scale', min: 0, max: 3 },
            { id: 'q5', text: 'Poor appetite or overeating', type: 'scale', min: 0, max: 3 },
            { id: 'q6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', type: 'scale', min: 0, max: 3 },
            { id: 'q7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', type: 'scale', min: 0, max: 3 },
            { id: 'q8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', type: 'scale', min: 0, max: 3 },
            { id: 'q9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', type: 'scale', min: 0, max: 3 }
        ]
    },
    {
        id: 'gad-7',
        title: 'GAD-7 Anxiety Scale',
        description: 'A screening tool for Generalized Anxiety Disorder.',
        type: 'anxiety',
        questions: [
             { id: 'q1', text: 'Feeling nervous, anxious, or on edge', type: 'scale', min: 0, max: 3 },
             { id: 'q2', text: 'Not being able to stop or control worrying', type: 'scale', min: 0, max: 3 },
             { id: 'q3', text: 'Worrying too much about different things', type: 'scale', min: 0, max: 3 },
             { id: 'q4', text: 'Trouble relaxing', type: 'scale', min: 0, max: 3 },
             { id: 'q5', text: 'Being so restless that it is hard to sit still', type: 'scale', min: 0, max: 3 },
             { id: 'q6', text: 'Becoming easily annoyed or irritable', type: 'scale', min: 0, max: 3 },
             { id: 'q7', text: 'Feeling afraid as if something awful might happen', type: 'scale', min: 0, max: 3 }
        ]
    }
];