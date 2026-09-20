# Dispatch: Worker Testing (Wave B - Unit Test Suite)

## Mission
Create a comprehensive, robust Unit Test Suite for real code in QuizMaster using Jest and React Testing Library, and ensure `npm test -- --watchAll=false` passes 100%.

## Mandatory Reading
- `D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md` (Mandatory)
- `D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md`
- `D:\test-demo-react\Quiz-question\PLAN.md` §5 (File Ownership Matrix)
- `D:\test-demo-react\Quiz-question\PLAN-SPEC-Platform.md` Phần A (Testing)

## File Ownership
You exclusively own:
- `src/test-utils.jsx` (create helper)
- `src/setupTests.js` (mocks for window.matchMedia, localStorage)
- `src/App.test.js` (fix existing failing test by wrapping with providers or asserting root structure)
- All `src/**/*.test.js` and `src/**/*.test.jsx`

DO NOT modify business logic in `src/component/**`, `server/**`, `package.json`! Only write test files and test setup utilities.

## Tasks to Implement
1. **Test Infrastructure**:
   - `src/setupTests.js`: Add robust mocks for `window.matchMedia`, `window.scrollTo`, and `localStorage`.
   - `src/test-utils.jsx`: Export a custom `renderWithProviders(ui, { preloadedState, store, route })` helper wrapping components in Redux `<Provider>` and React Router `<MemoryRouter>`.
   - Fix `src/App.test.js`: Use `renderWithProviders(<App />)` so it doesn't crash due to missing Redux/Router context.
2. **Auth & Reducer Unit Tests**:
   - `src/component/actions/redux/__tests__/userReducer.test.js`:
     - Initial state verification
     - `FETCH_USER_LOGIN_SUCCESS` (sets `auth: true`, token, username, role)
     - `USER_LOGOUT` (clears auth and resets state)
     - `UPDATE_USER_PROFILE` (updates username, avatar)
     - `REFRESH_TOKEN_SUCCESS` (updates token)
   - `src/hooks/__tests__/useAuth.test.js`: Test `useAuth` hook methods (`isAdmin`, `isUser`, `isAuthenticated`).
3. **Exam Engine Unit Tests**:
   - `src/utils/__tests__/score.test.js`: Comprehensive tests for `calculateScore`:
     - 100% correct answers
     - 0% correct answers
     - Empty/unanswered quiz
     - Multiple-choice questions with partial vs full selections
     - Accuracy percentage calculation and edge cases
   - `src/hooks/__tests__/useTimer.test.js`: Test countdown decrements, pause on window blur / visibilitychange, and zero-time auto-submit callback.
4. **Admin Console Unit Tests**:
   - `src/component/Admin/Content/__tests__/ModalCreateUser.test.jsx`: Form validation (email regex, password length, required fields, avatar size validation).
   - `src/component/Admin/Content/Quiz/__tests__/TableQuiz.test.jsx`: Table rendering, difficulty badges, actions buttons, empty state.

## Acceptance Criteria
- Execute `npm test -- --watchAll=false` and verify that 100% of test suites and test cases pass.
- Zero failures or errors.
- Document all created test files and execution output in `D:\test-demo-react\Quiz-question\.agents\worker_testing\handoff.md`.
- Notify parent via `send_message`.

## 2026-09-20T17:22:38Z
You are the Unit Testing Worker (Wave B) for QuizMaster.
Your working directory is: D:\test-demo-react\Quiz-question\.agents\worker_testing

MANDATORY FIRST STEP: Read:
- D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md
- D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md
- D:\test-demo-react\Quiz-question\.agents\worker_testing\DISPATCH.md
- D:\test-demo-react\Quiz-question\PLAN-SPEC-Platform.md Phần A

File Ownership:
You exclusively own:
- src/test-utils.jsx
- src/setupTests.js
- src/App.test.js
- All src/**/*.test.js and src/**/*.test.jsx

DO NOT modify business logic files. Only write test files and test setup utilities.

Tasks:
1. Fix setupTests.js (mocks for matchMedia, localStorage, scrollTo).
2. Create src/test-utils.jsx with renderWithProviders helper.
3. Fix src/App.test.js to render cleanly with providers.
4. Implement unit tests for:
   - userReducer (login, logout, update profile, refresh token)
   - useAuth hook
   - score calculation in src/utils/score.js (100%, 0%, partial, empty, edge cases)
   - useTimer hook (countdown, pause on blur/visibilitychange, timeout auto-submit)
   - ModalCreateUser and TableQuiz
5. Run `npm test -- --watchAll=false` and make sure 100% of tests pass.
6. Write your report to D:\test-demo-react\Quiz-question\.agents\worker_testing\handoff.md.
7. Notify parent via send_message.
