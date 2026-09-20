# Dispatch: Worker 3 (Admin Console Module)

## Mission
Upgrade the Admin Console into a full-featured management command center according to `PLAN-SPEC-Admin.md` and survey findings in `D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer\handoff.md`.

## Authoritative Documentation
- Read `D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md` (Mandatory)
- Read `D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md`
- Read `D:\test-demo-react\Quiz-question\PLAN.md` §5 (File Ownership Matrix)
- Read `PLAN-SPEC-Admin.md`
- Read `D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer\handoff.md`

## Exclusive File Ownership
You exclusively own and may modify:
- `src/component/Admin/Content/DashBoard.jsx` (+ scss)
- `src/component/Admin/Content/AnalyticsCharts.jsx` (create new SVG chart component)
- `src/component/Admin/Content/ManagerUser.jsx`, `ModalCreateUser.jsx`, `ModalUpdateUser.jsx`, `ViewUser.jsx`, `DeleteUser.jsx`, `TableUserPagination.jsx`, `Tables.jsx`, `ManageUser.scss`
- `src/component/Admin/Content/Quiz/**` (ManageQuiz.jsx, TableQuiz.jsx, ModalUpdateQuiz.jsx, ModalViewQuiz.jsx, ModalDelete.jsx, ModalAssignQuiz.jsx, ModalImportQuiz.jsx + scss)
- `src/component/Admin/Content/Question/**` (Questions.jsx, ModalPreviewQuestion.jsx + scss)
- `src/component/Admin/Admin.jsx` and `src/component/Admin/sidebar.jsx`

DO NOT modify files outside your ownership (e.g., `src/component/Admin/Auth/**`, `src/component/User/**`, `src/util/axiosCutomes.jsx`, `server/**`, `package.json`).

## Tasks to Implement
1. **Admin Dashboard (`DashBoard.jsx` & `AnalyticsCharts.jsx`)**:
   - Fetch real overview stats from `getOverview` (`/api/v1/overview`): Total Users, Total Quizzes, Total Questions, Total Answers.
   - Implement `AnalyticsCharts.jsx`: pure React SVG charts (daily submission trends bar/line chart, quiz difficulty distribution pie/donut chart) with zero extra NPM dependencies.
   - Loading skeleton and refresh button.
2. **User Management (`ManagerUser.jsx`, `TableUserPagination.jsx`, Modals)**:
   - Debounced search input (by name or email) passing `search` query parameter to API.
   - Full pagination support (`page`, `limit`).
   - `ModalCreateUser.jsx` & `ModalUpdateUser.jsx`: strict form validation (email format, non-empty username, role selection, avatar file upload with preview and size limit < 2MB).
   - Confirmation dialog for delete actions with success/error toast notifications.
3. **Quiz Management (`src/component/Admin/Content/Quiz/**`)**:
   - CRUD quizzes with cover image upload and preview.
   - **Assign Quiz to Multi-Users**: `ModalAssignQuiz.jsx` allows multi-selecting users and calling `postAssignQuiz` (`/api/v1/quiz-assign-to-user`).
   - **Duplicate Quiz**: clone an existing quiz and its questions via `POST /api/v1/quiz/:id/duplicate` (with client-side fallback cloning if backend not yet ready).
   - **Import & Export Quiz**:
     - Export quiz: export quiz metadata and questions into a downloadable JSON file.
     - Import quiz: `ModalImportQuiz.jsx` to upload a JSON file, validate schema, and create quiz + questions via API.
4. **Question Management (`Questions.jsx` & `ModalPreviewQuestion.jsx`)**:
   - Support question types: Single Choice, Multiple Choice, True/False.
   - Dynamic answer choices (add/remove answer options, toggle correct answers).
   - Image attachment support for questions.
   - **Candidate Preview Mode (`ModalPreviewQuestion.jsx`)**: preview exactly how the question appears to a candidate during an exam.
5. **UX & Responsive Enhancements**:
   - Ensure all data tables have `<div className="table-responsive">` to prevent mobile overflow.
   - Consistent empty states, loading indicators, and toast error/success handling.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Deliverables
- Verify your changes compile and run without breaking.
- Document all modified/created files and test status in `D:\test-demo-react\Quiz-question\.agents\worker_admin\handoff.md`.
- Send completion message to parent via `send_message`.

## 2026-09-20T17:01:08Z
You are Worker 3 (Admin Console Worker) for QuizMaster Wave A.
Your working directory is: D:\test-demo-react\Quiz-question\.agents\worker_admin

MANDATORY FIRST STEP: Read:
- D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md
- D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md
- D:\test-demo-react\Quiz-question\.agents\worker_admin\DISPATCH.md
- D:\test-demo-react\Quiz-question\PLAN-SPEC-Admin.md
- D:\test-demo-react\Quiz-question\.agents\survey_exam_admin_explorer\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You exclusively own and may modify:
- src/component/Admin/Content/DashBoard.jsx (+ scss)
- src/component/Admin/Content/AnalyticsCharts.jsx (create new pure SVG chart component)
- src/component/Admin/Content/ManagerUser.jsx, ModalCreateUser.jsx, ModalUpdateUser.jsx, ViewUser.jsx, DeleteUser.jsx, TableUserPagination.jsx, Tables.jsx, ManageUser.scss
- src/component/Admin/Content/Quiz/** (ManageQuiz.jsx, TableQuiz.jsx, ModalUpdateQuiz.jsx, ModalViewQuiz.jsx, ModalDelete.jsx, ModalAssignQuiz.jsx, ModalImportQuiz.jsx + scss)
- src/component/Admin/Content/Question/** (Questions.jsx, ModalPreviewQuestion.jsx + scss)
- src/component/Admin/Admin.jsx, src/component/Admin/sidebar.jsx

Implement all items listed in your DISPATCH.md:
1. DashBoard overview metrics from API + AnalyticsCharts pure React SVG charts (daily submissions, difficulty distribution) without new packages
2. User management with debounced search by name/email, pagination, avatar validation & preview, delete modal
3. Quiz management with CRUD, multi-user assignment modal, duplicate quiz, JSON export, and JSON import modal
4. Question management with support for single choice, multiple choice, true/false, dynamic answers, and candidate preview modal
5. Ensure all data tables have .table-responsive wrappers

Verify your code compiles and doesn't introduce syntax/import errors.
Write your detailed report to D:\test-demo-react\Quiz-question\.agents\worker_admin\handoff.md.
When complete, notify parent via send_message with a concise summary.

