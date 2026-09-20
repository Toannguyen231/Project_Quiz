import { calculateScore, formatScore, evaluateAnswerOption } from '../score';

describe('Score Calculation Utility (calculateScore)', () => {
    const sampleQuestions = [
        {
            id: 1,
            description: 'What is React?',
            answers: [
                { id: 101, description: 'A JS Library', isCorrect: true },
                { id: 102, description: 'A Database', isCorrect: false },
                { id: 103, description: 'An OS', isCorrect: false },
            ],
        },
        {
            id: 2,
            description: 'Which are React Hooks?',
            answers: [
                { id: 201, description: 'useState', isCorrect: true },
                { id: 202, description: 'useEffect', isCorrect: true },
                { id: 203, description: 'useClass', isCorrect: false },
            ],
        },
        {
            id: 3,
            description: 'Is JavaScript single threaded?',
            answers: [
                { id: 301, description: 'Yes', correct_answer: true },
                { id: 302, description: 'No', correct_answer: false },
            ],
        },
        {
            id: 4,
            description: 'What does JSX stand for?',
            answers: [
                { id: 401, description: 'JavaScript XML', iscorrect: 1 },
                { id: 402, description: 'Java Syntax Extension', iscorrect: 0 },
            ],
        },
    ];

    describe('Happy Paths & Percentage Benchmarks', () => {
        test('calculates 100% score when all questions are answered correctly', () => {
            const userAnswers = {
                1: [101],
                2: [201, 202],
                3: [301],
                4: [401],
            };

            const result = calculateScore(sampleQuestions, userAnswers);

            expect(result.totalQuestions).toBe(4);
            expect(result.correctCount).toBe(4);
            expect(result.incorrectCount).toBe(0);
            expect(result.unansweredCount).toBe(0);
            expect(result.percentage).toBe(100);
            expect(result.score).toBe(10);
            expect(result.passed).toBe(true);
            expect(result.details.every((d) => d.isCorrect)).toBe(true);
        });

        test('calculates 0% score when all selected answers are incorrect', () => {
            const userAnswers = {
                1: [102],
                2: [203],
                3: [302],
                4: [402],
            };

            const result = calculateScore(sampleQuestions, userAnswers);

            expect(result.totalQuestions).toBe(4);
            expect(result.correctCount).toBe(0);
            expect(result.incorrectCount).toBe(4);
            expect(result.unansweredCount).toBe(0);
            expect(result.percentage).toBe(0);
            expect(result.score).toBe(0);
            expect(result.passed).toBe(false);
            expect(result.details.every((d) => !d.isCorrect)).toBe(true);
        });

        test('calculates partial score and passing status (50% threshold)', () => {
            // 2 correct (50%), 1 incorrect, 1 unanswered
            const userAnswers = {
                1: [101], // correct
                2: [201, 202], // correct
                3: [302], // wrong
                // 4 is unanswered
            };

            const result = calculateScore(sampleQuestions, userAnswers);

            expect(result.totalQuestions).toBe(4);
            expect(result.correctCount).toBe(2);
            expect(result.incorrectCount).toBe(1);
            expect(result.unansweredCount).toBe(1);
            expect(result.percentage).toBe(50);
            expect(result.score).toBe(5);
            expect(result.passed).toBe(true); // >= 50 passes
        });
    });

    describe('Multiple Choice Partial vs Full Selection Logic', () => {
        const multiChoiceQuestion = [
            {
                id: 10,
                description: 'Select ALL frontend frameworks',
                answers: [
                    { id: 1001, description: 'React', isCorrect: true },
                    { id: 1002, description: 'Vue', isCorrect: true },
                    { id: 1003, description: 'Django', isCorrect: false },
                ],
            },
        ];

        test('evaluates as incorrect when user only selects partial correct answers', () => {
            // User selected only React, missed Vue
            const result = calculateScore(multiChoiceQuestion, { 10: [1001] });
            expect(result.correctCount).toBe(0);
            expect(result.incorrectCount).toBe(1);
            expect(result.details[0].isCorrect).toBe(false);
        });

        test('evaluates as incorrect when user selects all correct plus an incorrect answer', () => {
            // User selected React, Vue, AND Django
            const result = calculateScore(multiChoiceQuestion, { 10: [1001, 1002, 1003] });
            expect(result.correctCount).toBe(0);
            expect(result.incorrectCount).toBe(1);
            expect(result.details[0].isCorrect).toBe(false);
        });

        test('evaluates as correct when user selects exactly the correct answers regardless of order', () => {
            // User selected Vue, React in reverse order
            const result = calculateScore(multiChoiceQuestion, { 10: [1002, 1001] });
            expect(result.correctCount).toBe(1);
            expect(result.incorrectCount).toBe(0);
            expect(result.details[0].isCorrect).toBe(true);
        });
    });

    describe('Input Normalization & Edge Cases', () => {
        test('handles empty question set gracefully', () => {
            const emptyRes = calculateScore([], {});
            expect(emptyRes.total).toBe(0);
            expect(emptyRes.totalQuestions).toBe(0);
            expect(emptyRes.correctCount).toBe(0);
            expect(emptyRes.score).toBe(0);
            expect(emptyRes.passed).toBe(false);
            expect(emptyRes.details).toEqual([]);

            const nullRes = calculateScore(null, null);
            expect(nullRes.totalQuestions).toBe(0);
        });

        test('handles completely unanswered quiz (empty userAnswers object or array)', () => {
            const result = calculateScore(sampleQuestions, {});
            expect(result.totalQuestions).toBe(4);
            expect(result.unansweredCount).toBe(4);
            expect(result.correctCount).toBe(0);
            expect(result.incorrectCount).toBe(0);
            expect(result.percentage).toBe(0);
            expect(result.passed).toBe(false);
            expect(result.details.every((d) => d.isUnanswered)).toBe(true);
        });

        test('supports userAnswers formatted as an array of objects', () => {
            const userAnswersArray = [
                { questionId: 1, userAnswerId: [101] },
                { questionId: 2, answers: [201, 202] },
                { questionId: 3, userAnswerId: 301 }, // scalar answer id
            ];

            const result = calculateScore(sampleQuestions, userAnswersArray);
            expect(result.correctCount).toBe(3);
            expect(result.unansweredCount).toBe(1); // question 4 not in array
            expect(result.percentage).toBe(75);
            expect(result.score).toBe(7.5);
        });

        test('supports fallback to isSelected property inside question answers', () => {
            const embeddedQuestions = [
                {
                    id: 99,
                    answers: [
                        { id: 991, isCorrect: true, isSelected: true },
                        { id: 992, isCorrect: false, isSelected: false },
                    ],
                },
            ];

            // userAnswers is undefined for question 99
            const result = calculateScore(embeddedQuestions, {});
            expect(result.correctCount).toBe(1);
            expect(result.details[0].isCorrect).toBe(true);
        });

        test('correctly computes non-integer scores and percentages (e.g. 1 out of 3)', () => {
            const threeQuestions = sampleQuestions.slice(0, 3);
            // 1 out of 3 correct = 33.33% -> rounds to 33%, score = 3.33
            const result = calculateScore(threeQuestions, { 1: [101] });
            expect(result.totalQuestions).toBe(3);
            expect(result.correctCount).toBe(1);
            expect(result.percentage).toBe(33);
            expect(result.score).toBe(3.33);
            expect(result.passed).toBe(false); // < 50
        });

        test('coerces string and numeric ID mismatches safely', () => {
            const questionsWithNumId = [
                {
                    id: 5,
                    answers: [
                        { id: 501, isCorrect: true },
                        { id: 502, isCorrect: false },
                    ],
                },
            ];

            // String keys and string answer IDs
            const result = calculateScore(questionsWithNumId, { '5': ['501'] });
            expect(result.correctCount).toBe(1);
            expect(result.details[0].isCorrect).toBe(true);
        });
    });

    describe('formatScore & evaluateAnswerOption Helpers', () => {
        test('formatScore formats decimal numbers accurately', () => {
            expect(formatScore(8.5)).toBe('8.5 / 10');
            expect(formatScore(10, 20)).toBe('10.0 / 20');
            expect(formatScore(0)).toBe('0.0 / 10');
        });

        test('evaluateAnswerOption classifies choices correctly', () => {
            const systemCorrect = [101, 102];
            const userSelected = [101, 103];

            // User chose 101 and it is correct
            expect(evaluateAnswerOption(101, userSelected, systemCorrect)).toBe('USER_CORRECT');

            // System correct is 102 but user didn't choose it
            expect(evaluateAnswerOption(102, userSelected, systemCorrect)).toBe('SYSTEM_CORRECT');

            // User chose 103 but it is wrong
            expect(evaluateAnswerOption(103, userSelected, systemCorrect)).toBe('USER_WRONG');

            // Option 104 is not correct and not chosen
            expect(evaluateAnswerOption(104, userSelected, systemCorrect)).toBe('DEFAULT');
        });
    });
});
