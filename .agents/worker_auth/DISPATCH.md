# Dispatch: Worker 1 (Auth & User Module)

## Mission
Implement complete Auth & User subsystem for QuizMaster according to `PLAN-SPEC-Auth.md` and survey findings in `D:\test-demo-react\Quiz-question\.agents\survey_auth_explorer\handoff.md`.

## Authoritative Documentation
- Read `D:\test-demo-react\Quiz-question\.agents\ORIGINAL_REQUEST.md` (Mandatory)
- Read `D:\test-demo-react\Quiz-question\.agents\orchestrator\PROJECT.md`
- Read `D:\test-demo-react\Quiz-question\PLAN.md` §5 (File Ownership Matrix)
- Read `D:\test-demo-react\Quiz-question\PLAN-SPEC-Auth.md`
- Read `D:\test-demo-react\Quiz-question\.agents\survey_auth_explorer\handoff.md`

## Exclusive File Ownership
You exclusively own and may modify:
- `src/component/Admin/Auth/**` (Login.jsx, SignUp.jsx, styling)
- `src/hooks/useAuth.js` (create new)
- `src/component/User/Profile.jsx` (create new)
- `src/component/actions/redux/userReducer.jsx` (update actions & reducer)
- `src/util/axiosCutomes.jsx` (interceptor, token refresh, 401 retry)

DO NOT modify files outside your ownership (e.g., `src/component/User/DetailQuiz.jsx`, `src/component/Admin/Content/**`, `server/**`, `package.json`).

## Tasks to Implement
1. **Login & SignUp Forms**:
   - `Login.jsx`: email format validation, required fields, min length 6 password validation, loading spinner, disabled state during submit, react-toastify error handling.
   - `SignUp.jsx`: name, email, password, confirmPassword fields, validation matching password, min length 6, error toast, loading spinner.
2. **Axios Token Interceptor (`src/util/axiosCutomes.jsx`)**:
   - Attach `Authorization: Bearer <token>` from Redux state on every outgoing request.
   - Response interceptor: on HTTP 401, initiate refresh token request to `/api/v1/auth/refresh` (or `/api/v1/refresh`) with a mutex/queue to prevent concurrent refresh spam.
   - On refresh success: update token in Redux and retry failed queued requests.
   - On refresh failure: dispatch `USER_LOGOUT` and redirect to `/login`.
3. **Redux Store (`src/component/actions/redux/userReducer.jsx`)**:
   - Add action creators and reducers for `FETCH_USER_LOGIN_SUCCESS`, `USER_LOGOUT`, `UPDATE_USER_PROFILE`, `REFRESH_TOKEN_SUCCESS`.
   - Ensure user account state holds `auth: true`, `token`, `refresh_token`, `email`, `username`, `role`, `image`.
4. **Auth Hook (`src/hooks/useAuth.js`)**:
   - Provide `user`, `role`, `isAuthenticated`, `isAdmin`, `isUser`, `login`, `logout`, `updateProfile`.
5. **User Profile (`src/component/User/Profile.jsx`)**:
   - View/edit personal information: username, email, avatar image preview.
   - Change password tab/modal: current password, new password, confirm new password with validation.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Completion Deliverables
- Verify your changes compile and run without breaking.
- Document all modified/created files and test status in `D:\test-demo-react\Quiz-question\.agents\worker_auth\handoff.md`.
- Send completion message to parent via `send_message`.

## 2026-09-20T17:01:08Z
You are Worker 1 (Auth Module Worker) for QuizMaster Wave A.
Your working directory is: D:\test-demo-react\Quiz-question\.agents\worker_auth
Implement all items listed in your DISPATCH.md:
1. Login & SignUp form validation, loading states, error toasts
2. Axios token interceptor with auto Bearer injection, 401 interception, refresh token mutex/queue and retry
3. Redux userReducer actions (login success, logout, update profile, refresh token success)
4. useAuth hook (user, role, isAuthenticated, isAdmin, isUser)
5. User Profile component (view/edit info, change password)
