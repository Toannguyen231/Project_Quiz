import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsCharts from '../AnalyticsCharts';
import ModalPreviewQuestion from '../Question/ModalPreviewQuestion';

describe('Wave A Challenger 2 - Adversarial Verification Suite', () => {

    /* =========================================================================
       SCOPE 1: JSON IMPORT / EXPORT VALIDATION
       ========================================================================= */
    describe('1. JSON Import & Export Schema Adversarial Tests', () => {

        // Exact validation algorithm extracted from ModalImportQuiz.jsx
        const validateQuizImport = (data) => {
            if (!data || typeof data !== 'object') {
                return { isValid: false, error: 'Tệp JSON không hợp lệ: cú pháp JSON bị lỗi!' };
            }

            const quizMeta = data.quiz || {
                name: data.name,
                description: data.description || '',
                difficulty: data.difficulty || 'EASY'
            };

            if (!quizMeta || !quizMeta.name || !quizMeta.name.trim()) {
                return { isValid: false, error: 'Dữ liệu JSON thiếu tên bài thi (quiz.name)!' };
            }

            const questions = Array.isArray(data.questions) ? data.questions : [];
            if (questions.length === 0) {
                return { isValid: false, error: 'Dữ liệu JSON không chứa danh sách câu hỏi nào (mảng questions rỗng)!' };
            }

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q || !q.description || !q.description.trim()) {
                    return { isValid: false, error: `Câu hỏi thứ ${i + 1} thiếu nội dung (description)!` };
                }
                const answers = q.answers || q.answer || [];
                if (!Array.isArray(answers) || answers.length < 2) {
                    return { isValid: false, error: `Câu hỏi thứ ${i + 1} phải có ít nhất 2 đáp án lựa chọn!` };
                }
                const hasCorrect = answers.some(a => a.isCorrect || a.iscorrect);
                if (!hasCorrect) {
                    return { isValid: false, error: `Câu hỏi thứ ${i + 1} chưa có đáp án đúng nào (isCorrect: true)!` };
                }
            }

            return {
                isValid: true,
                parsedData: { quiz: quizMeta, questions }
            };
        };

        test('Rejects malformed JSON syntax and non-object roots', () => {
            const malformedJson = '{ "name": "Test", broken }';
            let parseFailed = false;
            try {
                JSON.parse(malformedJson);
            } catch (e) {
                parseFailed = true;
            }
            expect(parseFailed).toBe(true);

            expect(validateQuizImport(null).isValid).toBe(false);
            expect(validateQuizImport(null).error).toContain('cú pháp JSON bị lỗi');
            expect(validateQuizImport("plain string").isValid).toBe(false);
        });

        test('Rejects empty objects and missing quiz name', () => {
            expect(validateQuizImport({}).isValid).toBe(false);
            expect(validateQuizImport({}).error).toContain('thiếu tên bài thi');

            expect(validateQuizImport({ quiz: { name: '   ' } }).isValid).toBe(false);
            expect(validateQuizImport({ quiz: { name: '   ' } }).error).toContain('thiếu tên bài thi');

            expect(validateQuizImport({ name: '' }).isValid).toBe(false);
            expect(validateQuizImport({ name: '' }).error).toContain('thiếu tên bài thi');
        });

        test('Rejects empty or missing questions array', () => {
            expect(validateQuizImport({ quiz: { name: 'React Quiz' } }).isValid).toBe(false);
            expect(validateQuizImport({ quiz: { name: 'React Quiz' } }).error).toContain('mảng questions rỗng');

            expect(validateQuizImport({ quiz: { name: 'React Quiz' }, questions: [] }).isValid).toBe(false);
            expect(validateQuizImport({ quiz: { name: 'React Quiz' }, questions: [] }).error).toContain('mảng questions rỗng');

            expect(validateQuizImport({ quiz: { name: 'React Quiz' }, questions: "not an array" }).isValid).toBe(false);
            expect(validateQuizImport({ quiz: { name: 'React Quiz' }, questions: "not an array" }).error).toContain('mảng questions rỗng');
        });

        test('Rejects questions with empty description', () => {
            const payload = {
                quiz: { name: 'React Quiz' },
                questions: [
                    { description: '   ', answers: [{ description: 'A', isCorrect: true }, { description: 'B', isCorrect: false }] }
                ]
            };
            const res = validateQuizImport(payload);
            expect(res.isValid).toBe(false);
            expect(res.error).toContain('Câu hỏi thứ 1 thiếu nội dung');
        });

        test('Rejects questions with fewer than 2 answers or non-array answers', () => {
            const noAnswers = {
                quiz: { name: 'React Quiz' },
                questions: [{ description: 'Q1', answers: [] }]
            };
            expect(validateQuizImport(noAnswers).isValid).toBe(false);
            expect(validateQuizImport(noAnswers).error).toContain('ít nhất 2 đáp án');

            const singleAnswer = {
                quiz: { name: 'React Quiz' },
                questions: [{ description: 'Q1', answers: [{ description: 'A', isCorrect: true }] }]
            };
            expect(validateQuizImport(singleAnswer).isValid).toBe(false);
            expect(validateQuizImport(singleAnswer).error).toContain('ít nhất 2 đáp án');

            const nullAnswers = {
                quiz: { name: 'React Quiz' },
                questions: [{ description: 'Q1', answers: null }]
            };
            expect(validateQuizImport(nullAnswers).isValid).toBe(false);
            expect(validateQuizImport(nullAnswers).error).toContain('ít nhất 2 đáp án');
        });

        test('Rejects questions without any correct answer (isCorrect: true)', () => {
            const payload = {
                quiz: { name: 'React Quiz' },
                questions: [{
                    description: 'Q1',
                    answers: [
                        { description: 'A', isCorrect: false },
                        { description: 'B', isCorrect: false },
                        { description: 'C', isCorrect: false }
                    ]
                }]
            };
            const res = validateQuizImport(payload);
            expect(res.isValid).toBe(false);
            expect(res.error).toContain('chưa có đáp án đúng nào');
        });

        test('Accepts valid JSON structures with nested quiz or flat fields, and both isCorrect/iscorrect keys', () => {
            // Nested structure with isCorrect
            const nested = {
                quiz: { name: 'Jest Testing', description: 'Unit testing', difficulty: 'MEDIUM' },
                questions: [{
                    description: 'What does expect() do?',
                    answers: [
                        { description: 'Creates an assertion', isCorrect: true },
                        { description: 'Runs a loop', isCorrect: false }
                    ]
                }]
            };
            const res1 = validateQuizImport(nested);
            expect(res1.isValid).toBe(true);
            expect(res1.parsedData.quiz.name).toBe('Jest Testing');

            // Flat structure with iscorrect & answer
            const flat = {
                name: 'Flat Quiz',
                difficulty: 'HARD',
                questions: [{
                    description: 'Is SQLite embedded?',
                    answer: [
                        { description: 'Yes', iscorrect: true },
                        { description: 'No', iscorrect: false }
                    ]
                }]
            };
            const res2 = validateQuizImport(flat);
            expect(res2.isValid).toBe(true);
            expect(res2.parsedData.quiz.name).toBe('Flat Quiz');
        });

        test('Verifies Export-Import Round-Trip Compatibility', () => {
            // Simulated export payload structure from ManageQuiz.jsx line 219
            const exportedPayload = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                quiz: {
                    id: 99,
                    name: 'Certified JavaScript Expert',
                    description: 'Comprehensive JS test',
                    difficulty: 'HARD',
                },
                questions: [
                    {
                        id: 101,
                        description: 'What is event loop?',
                        type: 'SINGLE',
                        answers: [
                            { id: 201, description: 'Call stack and task queue orchestrator', isCorrect: true },
                            { id: 202, description: 'A for loop in browser', isCorrect: false }
                        ]
                    },
                    {
                        id: 102,
                        description: 'Which are JS primitives?',
                        type: 'MULTIPLE',
                        answers: [
                            { id: 203, description: 'string', isCorrect: true },
                            { id: 204, description: 'symbol', isCorrect: true },
                            { id: 205, description: 'Array', isCorrect: false }
                        ]
                    }
                ]
            };

            const importResult = validateQuizImport(exportedPayload);
            expect(importResult.isValid).toBe(true);
            expect(importResult.parsedData.quiz.name).toBe('Certified JavaScript Expert');
            expect(importResult.parsedData.questions.length).toBe(2);
        });
    });

    /* =========================================================================
       SCOPE 2: USER FORM VALIDATION (ModalCreateUser & ModalUpdateUser)
       ========================================================================= */
    describe('2. User Form Validation Adversarial Tests', () => {

        // Regex extracted from ModalCreateUser.jsx line 57
        const validateEmail = (emailStr) => {
            return String(emailStr)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        const validateCreateUserForm = ({ email, password, username, role }) => {
            const trimmedEmail = (email || '').trim();
            const trimmedUsername = (username || '').trim();

            if (!validateEmail(trimmedEmail)) {
                return { isValid: false, error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng!' };
            }
            if (!password || password.length < 6) {
                return { isValid: false, error: 'Mật khẩu không được để trống và phải có ít nhất 6 ký tự!' };
            }
            if (!trimmedUsername || trimmedUsername.length < 2) {
                return { isValid: false, error: 'Tên người dùng phải có ít nhất 2 ký tự!' };
            }
            if (!['USER', 'ADMIN'].includes(role)) {
                return { isValid: false, error: 'Vai trò người dùng không hợp lệ!' };
            }
            return { isValid: true };
        };

        const validateAvatarFile = (file) => {
            if (!file) return { isValid: true }; // Avatar is optional
            if (!file.type || !file.type.startsWith('image/')) {
                return { isValid: false, error: 'Tệp tải lên phải là hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)!' };
            }
            const maxSizeInBytes = 2 * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                return { isValid: false, error: 'Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!' };
            }
            return { isValid: true };
        };

        test('Email validation catches malicious and malformed formats', () => {
            const invalidEmails = [
                'plainaddress',
                '#@%^%#$@#$@#.com',
                '@missingusername.com',
                'username@.com',
                'username@com',
                'spaces in email@domain.com',
                '',
                '   '
            ];
            invalidEmails.forEach((invalidEmail) => {
                expect(validateEmail(invalidEmail)).toBeNull();
                const res = validateCreateUserForm({
                    email: invalidEmail,
                    password: 'password123',
                    username: 'Valid User',
                    role: 'USER'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toContain('Email không hợp lệ');
            });

            const validEmails = [
                'user@example.com',
                'user.name+tag@sub.domain.edu.vn',
                'admin_123@quizmaster.io'
            ];
            validEmails.forEach((validEmail) => {
                expect(validateEmail(validEmail)).not.toBeNull();
            });
        });

        test('Password boundary condition tests (< 6 chars vs >= 6 chars)', () => {
            const shortPasswords = ['', '1', '123', '12345'];
            shortPasswords.forEach((pw) => {
                const res = validateCreateUserForm({
                    email: 'test@quiz.com',
                    password: pw,
                    username: 'Valid User',
                    role: 'USER'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toContain('ít nhất 6 ký tự');
            });

            const validRes = validateCreateUserForm({
                email: 'test@quiz.com',
                password: '123456', // exactly 6 chars
                username: 'Valid User',
                role: 'USER'
            });
            expect(validRes.isValid).toBe(true);
        });

        test('Username boundary condition tests (< 2 chars vs >= 2 chars)', () => {
            const invalidUsernames = ['', '   ', 'A'];
            invalidUsernames.forEach((name) => {
                const res = validateCreateUserForm({
                    email: 'test@quiz.com',
                    password: 'secretPassword',
                    username: name,
                    role: 'USER'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toContain('ít nhất 2 ký tự');
            });

            const validNameRes = validateCreateUserForm({
                email: 'test@quiz.com',
                password: 'secretPassword',
                username: 'An', // exactly 2 chars
                role: 'USER'
            });
            expect(validNameRes.isValid).toBe(true);
        });

        test('Role whitelist validation (only USER and ADMIN permitted)', () => {
            ['SUPERADMIN', 'ROOT', 'GUEST', '', null].forEach((invalidRole) => {
                const res = validateCreateUserForm({
                    email: 'test@quiz.com',
                    password: 'secretPassword',
                    username: 'Valid Name',
                    role: invalidRole
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toContain('Vai trò người dùng không hợp lệ');
            });

            expect(validateCreateUserForm({ email: 't@q.com', password: '123456', username: 'Ok', role: 'USER' }).isValid).toBe(true);
            expect(validateCreateUserForm({ email: 't@q.com', password: '123456', username: 'Ok', role: 'ADMIN' }).isValid).toBe(true);
        });

        test('Avatar size and MIME boundary validation', () => {
            const twoMB = 2 * 1024 * 1024;

            // Exactly 2MB -> Allowed
            const fileAtLimit = { size: twoMB, type: 'image/png' };
            expect(validateAvatarFile(fileAtLimit).isValid).toBe(true);

            // 2MB + 1 byte -> Rejected
            const fileExceedLimit = { size: twoMB + 1, type: 'image/png' };
            const exceedRes = validateAvatarFile(fileExceedLimit);
            expect(exceedRes.isValid).toBe(false);
            expect(exceedRes.error).toContain('vượt quá 2MB');

            // 10MB -> Rejected
            const heavyFile = { size: 10 * 1024 * 1024, type: 'image/jpeg' };
            expect(validateAvatarFile(heavyFile).isValid).toBe(false);

            // Invalid MIME types
            const nonImageFiles = [
                { size: 500, type: 'application/pdf' },
                { size: 500, type: 'text/plain' },
                { size: 500, type: 'application/octet-stream' },
                { size: 500, type: '' }
            ];
            nonImageFiles.forEach((file) => {
                const res = validateAvatarFile(file);
                expect(res.isValid).toBe(false);
                expect(res.error).toContain('phải là hình ảnh hợp lệ');
            });
        });
    });

    /* =========================================================================
       SCOPE 3: QUESTION BUILDER TYPES LOGIC (SINGLE vs MULTIPLE vs TRUE_FALSE)
       ========================================================================= */
    describe('3. Question Builder Types Logic & Candidate Preview', () => {

        // Logic from Questions.jsx line 161
        const applyQuestionTypeChange = (question, newType) => {
            const cloned = JSON.parse(JSON.stringify(question));
            cloned.type = newType;
            if (newType === 'TRUE_FALSE') {
                cloned.answer = [
                    { id: 'ans-true', description: 'Đúng (True)', iscorrect: true },
                    { id: 'ans-false', description: 'Sai (False)', iscorrect: false },
                ];
            } else if (newType === 'SINGLE') {
                let foundCorrect = false;
                cloned.answer = cloned.answer.map((a) => {
                    if (a.iscorrect && !foundCorrect) {
                        foundCorrect = true;
                        return a;
                    }
                    return { ...a, iscorrect: false };
                });
                if (!foundCorrect && cloned.answer.length > 0) {
                    cloned.answer[0].iscorrect = true;
                }
            }
            return cloned;
        };

        // Radio vs Checkbox click handler from Questions.jsx line 248
        const applyAnswerCorrectToggle = (question, targetAnswerId, checkedValue) => {
            const cloned = JSON.parse(JSON.stringify(question));
            const isSingleSelection = cloned.type === 'SINGLE' || cloned.type === 'TRUE_FALSE';

            cloned.answer = cloned.answer.map((ans) => {
                if (isSingleSelection) {
                    return { ...ans, iscorrect: ans.id === targetAnswerId };
                } else {
                    if (ans.id === targetAnswerId) {
                        return { ...ans, iscorrect: checkedValue };
                    }
                    return ans;
                }
            });
            return cloned;
        };

        test('Switching from MULTIPLE (multi correct) to SINGLE enforces exactly ONE correct answer', () => {
            const multiQuestion = {
                id: 'q1',
                type: 'MULTIPLE',
                answer: [
                    { id: 'a1', description: 'Option 1', iscorrect: true },
                    { id: 'a2', description: 'Option 2', iscorrect: true },
                    { id: 'a3', description: 'Option 3', iscorrect: false }
                ]
            };

            const singleQuestion = applyQuestionTypeChange(multiQuestion, 'SINGLE');
            expect(singleQuestion.type).toBe('SINGLE');
            const correctAnswers = singleQuestion.answer.filter(a => a.iscorrect);
            expect(correctAnswers.length).toBe(1);
            expect(correctAnswers[0].id).toBe('a1');
            expect(singleQuestion.answer[1].iscorrect).toBe(false);
        });

        test('Switching to SINGLE when NO answers were correct automatically defaults first answer to correct', () => {
            const noCorrectQuestion = {
                id: 'q2',
                type: 'MULTIPLE',
                answer: [
                    { id: 'a1', description: 'Option 1', iscorrect: false },
                    { id: 'a2', description: 'Option 2', iscorrect: false }
                ]
            };

            const singleQuestion = applyQuestionTypeChange(noCorrectQuestion, 'SINGLE');
            const correctAnswers = singleQuestion.answer.filter(a => a.iscorrect);
            expect(correctAnswers.length).toBe(1);
            expect(correctAnswers[0].id).toBe('a1');
        });

        test('Switching to TRUE_FALSE replaces options with standard True/False answers', () => {
            const complexQuestion = {
                id: 'q3',
                type: 'SINGLE',
                answer: [
                    { id: 'a1', description: 'Custom 1', iscorrect: true },
                    { id: 'a2', description: 'Custom 2', iscorrect: false },
                    { id: 'a3', description: 'Custom 3', iscorrect: false },
                    { id: 'a4', description: 'Custom 4', iscorrect: false },
                ]
            };

            const tfQuestion = applyQuestionTypeChange(complexQuestion, 'TRUE_FALSE');
            expect(tfQuestion.type).toBe('TRUE_FALSE');
            expect(tfQuestion.answer.length).toBe(2);
            expect(tfQuestion.answer[0].description).toBe('Đúng (True)');
            expect(tfQuestion.answer[0].iscorrect).toBe(true);
            expect(tfQuestion.answer[1].description).toBe('Sai (False)');
            expect(tfQuestion.answer[1].iscorrect).toBe(false);
        });

        test('Clicking answer in SINGLE mode unchecks previous answer (radio behavior)', () => {
            let question = {
                id: 'q4',
                type: 'SINGLE',
                answer: [
                    { id: 'a1', description: 'Option 1', iscorrect: true },
                    { id: 'a2', description: 'Option 2', iscorrect: false },
                ]
            };

            // User selects a2
            question = applyAnswerCorrectToggle(question, 'a2', true);
            expect(question.answer.find(a => a.id === 'a1').iscorrect).toBe(false);
            expect(question.answer.find(a => a.id === 'a2').iscorrect).toBe(true);
        });

        test('Clicking answers in MULTIPLE mode toggles independently (checkbox behavior)', () => {
            let question = {
                id: 'q5',
                type: 'MULTIPLE',
                answer: [
                    { id: 'a1', description: 'Option 1', iscorrect: true },
                    { id: 'a2', description: 'Option 2', iscorrect: false },
                ]
            };

            // User marks a2 as correct without unchecking a1
            question = applyAnswerCorrectToggle(question, 'a2', true);
            expect(question.answer.find(a => a.id === 'a1').iscorrect).toBe(true);
            expect(question.answer.find(a => a.id === 'a2').iscorrect).toBe(true);

            // User unchecks a1
            question = applyAnswerCorrectToggle(question, 'a1', false);
            expect(question.answer.find(a => a.id === 'a1').iscorrect).toBe(false);
            expect(question.answer.find(a => a.id === 'a2').iscorrect).toBe(true);
        });

        test('Candidate Preview evaluation in ModalPreviewQuestion Component', () => {
            const testQuestion = {
                id: 'q-preview',
                type: 'MULTIPLE',
                description: 'Which methods mutate an array?',
                answer: [
                    { id: 'opt-push', description: 'push()', iscorrect: true },
                    { id: 'opt-filter', description: 'filter()', iscorrect: false },
                    { id: 'opt-splice', description: 'splice()', iscorrect: true }
                ]
            };

            const { container, unmount } = render(
                <ModalPreviewQuestion
                    show={true}
                    setShow={() => {}}
                    question={testQuestion}
                    questionIndex={1}
                    quizName="JavaScript Core"
                />
            );

            // Modal displays question and candidate options
            expect(screen.getByText('Which methods mutate an array?')).toBeInTheDocument();
            expect(screen.getByText('push()')).toBeInTheDocument();
            expect(screen.getByText('filter()')).toBeInTheDocument();
            expect(screen.getByText('splice()')).toBeInTheDocument();

            // Select only push() -> partial answer
            fireEvent.click(screen.getByText('push()'));
            const checkButton = screen.getByText('Kiểm tra kết quả');
            fireEvent.click(checkButton);

            // Should be evaluated as INCORRECT (incomplete selection)
            expect(screen.getByText(/Thí sinh trả lời SAI/i)).toBeInTheDocument();

            unmount();
        });
    });

    /* =========================================================================
       SCOPE 4: SVG CHARTS RESILIENCE (AnalyticsCharts.jsx)
       ========================================================================= */
    describe('4. Pure React SVG Charts Edge-Case Resilience Tests', () => {

        test('Renders without crashing when dailyData and difficultyData are empty arrays', () => {
            const { container } = render(
                <AnalyticsCharts
                    dailyData={[]}
                    difficultyData={[]}
                    summary={{ avgScore: 7.0, passRate: 75, totalExams: 10 }}
                />
            );
            // Default fallbacks take over gracefully
            expect(screen.getByText('Tỉ Lệ Đạt (Pass Rate)')).toBeInTheDocument();
            const svgs = container.querySelectorAll('svg');
            expect(svgs.length).toBe(2); // Bar/Line SVG and Donut SVG
        });

        test('Renders safely with single data point in dailyData (no division by zero)', () => {
            const singleDayData = [{ date: '21/09', count: 25, avgScore: 8.5 }];
            const { container, getByText } = render(
                <AnalyticsCharts
                    dailyData={singleDayData}
                    difficultyData={[{ difficulty: 'MEDIUM', count: 4 }]}
                />
            );

            // Verify single bar rendered
            const rects = container.querySelectorAll('rect');
            expect(rects.length).toBe(1);
            expect(rects[0].getAttribute('height')).not.toBe('NaN');
            expect(Number(rects[0].getAttribute('height'))).toBeGreaterThan(0);

            // Switch to Line chart
            const lineBtn = getByText('Đường (Line)');
            fireEvent.click(lineBtn);

            const circles = container.querySelectorAll('circle');
            expect(circles.length).toBe(1);
            expect(circles[0].getAttribute('cx')).not.toBe('NaN');
            expect(circles[0].getAttribute('cy')).not.toBe('NaN');
        });

        test('Renders safely with negative numbers and zero values in dailyData', () => {
            const adversarialDaily = [
                { date: '01/01', count: -5 },
                { date: '02/01', count: 0 },
                { date: '03/01', count: 12 }
            ];
            const { container } = render(
                <AnalyticsCharts
                    dailyData={adversarialDaily}
                />
            );

            const rects = container.querySelectorAll('rect');
            expect(rects.length).toBe(3);
            rects.forEach((rect) => {
                const h = rect.getAttribute('height');
                expect(h).not.toBe('NaN');
                // Bar height has a Math.max(4, ...) safety clamp
                expect(Number(h)).toBeGreaterThanOrEqual(4);
            });
        });

        test('Renders safely with single 100% slice (360 degrees) in Donut Chart', () => {
            const singleSliceDiff = [
                { difficulty: 'EASY', count: 42, label: 'Dễ (Easy)', color: '#10b981' }
            ];
            const { container } = render(
                <AnalyticsCharts
                    difficultyData={singleSliceDiff}
                />
            );

            const paths = container.querySelectorAll('path');
            // Check donut arc path
            const donutPath = Array.from(paths).find(p => p.getAttribute('fill') === '#10b981');
            expect(donutPath).toBeDefined();
            const d = donutPath.getAttribute('d');
            expect(d).not.toBe('');
            expect(d).not.toContain('NaN');
            expect(d).toContain('M');
            expect(d).toContain('A');
            expect(screen.getByText('100%')).toBeInTheDocument();
        });

        test('Renders safely when all difficulty counts are 0 (zero total)', () => {
            const allZeroDiff = [
                { difficulty: 'EASY', count: 0 },
                { difficulty: 'MEDIUM', count: 0 },
                { difficulty: 'HARD', count: 0 }
            ];
            const { container } = render(
                <AnalyticsCharts
                    difficultyData={allZeroDiff}
                />
            );

            // Should not produce NaN in percent or arc
            expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1);
        });

        test('Check summary prop default and partial fallback', () => {
            // Render with empty summary object
            const { getByText } = render(
                <AnalyticsCharts
                    summary={{}}
                />
            );
            // Uses nullish coalescing ?? 78% and ?? 7.6
            expect(getByText('78%')).toBeInTheDocument();
            expect(getByText(/7.6\/10/)).toBeInTheDocument();
        });
    });
});
