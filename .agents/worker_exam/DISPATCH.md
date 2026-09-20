# Dispatch: Worker 2 (Exam Engine Module)

## Mission
Upgrade the candidate examination experience into a professional exam engine according to `PLAN-SPEC-Exam.md` and survey findings in `D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer\handoff.md`.

## Authoritative Documentation
- Read `D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md` (Mandatory)
- Read `D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md`
- Read `D:\test-demo-react\Quiz-question\PLAN.md` §5 (File Ownership Matrix)
- Read `PLAN-SPEC-Exam.md`
- Read `D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer\handoff.md`

## Exclusive File Ownership
You exclusively own and may modify:
- `src/component/User/DetailQuiz.jsx` + `.scss`
- `src/component/User/Question.jsx` + `.scss`
- `src/component/User/ModalResult.jsx` + `.scss`
- `src/component/User/ListQuiz.jsx` + `.scss`
- `src/component/User/User.jsx`
- `src/hooks/useTimer.js` (create new)
- `src/hooks/useExamProgress.js` (create new)
- `src/component/User/QuestionPalette.jsx` (create new)
- `src/utils/score.js` (create new)

DO NOT modify files outside your ownership (e.g., `src/component/Admin/**`, `src/util/axiosCutomes.jsx`, `server/**`, `package.json`).

## Tasks to Implement
1. **Custom Hook `src/hooks/useTimer.js`**:
   - Countdown from `duration` (in seconds or minutes).
   - Format MM:SS, alert state when time is under 5 minutes.
   - Anti-cheat auto-pause: detect window blur / `visibilitychange`, pause timer and trigger warning.
   - Auto-submit: automatically trigger submit callback when timer reaches 0.
2. **Custom Hook `src/hooks/useExamProgress.js`**:
   - Auto-save candidate answers to `localStorage` keyed by `quizId` and user id.
   - Restore state cleanly on browser reload (answers, current question index, elapsed time).
   - Debounced sync helper for backend progress saving (`PUT /submissions/:id/progress`).
3. **Question Palette (`src/component/User/QuestionPalette.jsx`)**:
   - Grid layout of questions with status color-coding:
     - Unanswered (default gray/outline)
     - Currently viewed (highlighted/active)
     - Answered (solid primary/success)
     - Flagged for review (warning/flag icon)
   - Jump directly to question on click.
4. **Scoring Logic (`src/utils/score.js`)**:
   - Pure function `calculateScore(questions, userAnswers)` for easy unit testing.
   - Return total questions, correct count, incorrect count, skipped count, accuracy percentage.
5. **Exam Engine Enhancement (`DetailQuiz.jsx`, `Question.jsx`)**:
   - Integrate `useTimer`, `useExamProgress`, `QuestionPalette`.
   - "Flag for Review" toggle button for each question.
   - Submission confirmation dialog showing: "You have completed X of Y questions. Z questions remain unanswered. Are you sure you want to submit?"
   - Anti-cheat warning: monitor tab switch count; if user leaves tab > 3 times, show firm warning.
6. **Result & Review Mode (`ModalResult.jsx`, `DetailQuiz.jsx`)**:
   - Comprehensive score card: score, percentage, correct/wrong/unanswered, time spent.
   - Detailed review screen: step through questions with correct answers highlighted, explanations shown, and user selections indicated.
7. **Quiz List (`ListQuiz.jsx`)**:
   - Connect to `getQuizByUser` (`/api/v1/quiz-by-participant`).
   - Cards showing title, description, difficulty badge, duration, question count.
   - Loading skeleton and clean empty state.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Deliverables
- Verify your changes compile and run without breaking.
- Document all modified/created files and test status in `D:\test-demo-react\Quiz-question\.agents\worker_exam\handoff.md`.
- Send completion message to parent via `send_message`.

## 2026-09-20T17:01:08Z
Received worker invocation from parent:
You are Worker 2 (Exam Engine Worker) for QuizMaster Wave A.
Your working directory is: D:\test-demo-react\Quiz-question\.agents\worker_exam
Tasks:
1. useTimer hook
2. useExamProgress hook
3. QuestionPalette component
4. Pure scoring logic in src/utils/score.js
5. DetailQuiz & Question enhancement
6. ModalResult & review mode
7. ListQuiz with cards, duration, question count, difficulty badge, skeleton loading, empty state
