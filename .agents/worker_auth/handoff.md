# Handoff Report: Worker 1 (Auth & User Subsystem)

> **Agent:** Worker 1 (`worker_auth`)  
> **Target:** Orchestrator (Parent: `11542a74-a4bf-47fe-9863-729b2d2b58f1`)  
> **Working Directory:** `D:\test-demo-react\Quiz-question\.agents\worker_auth`  
> **Timestamp:** 2026-09-20T17:10:30Z  
> **Handoff Type:** Hard Handoff (Task Complete)

---

## 1. Observation

### 1.1 Baseline State Observed
- Prior to implementation, `Login.jsx` only verified email regex and non-empty password; it lacked min-length 6 validation and did not redirect already authenticated visitors.
- `SignUp.jsx` lacked a `confirmPassword` input, matching password validation, password length checks, and loading indicators.
- `src/component/util/axiosCutomes.jsx` and `src/util/axiosCutomes.jsx` did not handle HTTP 401 status errors, lacked token refresh logic, and did not set `withCredentials: true`.
- `userReducer.jsx` only supported `FETCH_USER_LOGIN_SUCCESS` and `FETCH_USER_LOGIN_FAIL`; the `account` slice was missing the `image`, `token`, and `auth: true` fields.
- Neither `src/hooks/useAuth.js` nor `src/component/User/Profile.jsx` existed.
- No route guard or role-based access control component was provided.

### 1.2 Delivered Artifacts & Exact Modifications
1. **Redux Store & Actions (`src/component/actions/Actions.jsx` & `src/component/actions/redux/userReducer.jsx`)**:
   - Added action types and creators: `USER_LOGOUT`, `UPDATE_USER_PROFILE`, `REFRESH_TOKEN_SUCCESS`.
   - Updated `INITIAL_STATE.account` to include `{ access_token, token, refresh_token, username, email, role, roles, image, auth: false }`.
   - Added case handlers in `userReducer.jsx`:
     - `FETCH_USER_LOGIN_SUCCESS`: Normalizes `token`, `refresh_token`, `email`, `username`, `role` (uppercased), `roles`, `image`, and sets `auth: true`, `isAuthenticated: true`.
     - `REFRESH_TOKEN_SUCCESS`: Updates `access_token` and `token` (and `refresh_token` if returned) while preserving existing profile data.
     - `UPDATE_USER_PROFILE`: Seamlessly updates `username`, `email`, `image`, and `role` without disturbing session tokens.
     - `USER_LOGOUT` (and legacy `FETCH_USER_LOGIN_FAIL`/`FETCH_USER_LOGOUT_FAIL`): Resets `account` and sets `isAuthenticated: false`.

2. **Axios Interceptor (`src/component/util/axiosCutomes.jsx` & `src/util/axiosCutomes.jsx`)**:
   - Configured `baseURL: '/api/v1'`, `timeout: 15000`, `withCredentials: true`.
   - Request interceptor: Reads token from Redux store (`account.access_token` or `account.token`) and attaches `Authorization: Bearer <token>` on all outgoing requests.
   - Response interceptor: Catches HTTP 401 errors:
     - Prevents refresh recursion on auth endpoints (`/login`, `/register`, `/refresh`, `/logout`) and already-retried requests (`_retry`).
     - Mutex queue mechanism: If token refresh is in flight (`isRefreshing = true`), queues subsequent requests in `failedQueue`.
     - Initiates refresh via `POST /api/v1/auth/refresh` (with automatic fallback to `POST /api/v1/refresh`).
     - On refresh success: Updates Redux store via `refreshTokenSuccess`, updates default headers, flushes queued requests with new token, and retries the original request.
     - On refresh failure: Clears queue, dispatches `userLogout()`, and redirects to `/login`.

3. **Custom Hook `useAuth` (`src/hooks/useAuth.js`)**:
   - Exposes: `{ user, account, role, isAuthenticated, isAdmin, isUser, login, logout, updateProfile, refreshTokens }`.
   - Normalizes roles (`ADMIN` vs `USER`), provides boolean role helpers, and encapsulates Redux dispatches and logout cache purges.

4. **Login & SignUp Forms (`src/component/Admin/Auth/Login.jsx` & `SignUp.jsx`)**:
   - `Login.jsx`: Added required field validation, email regex format validation, min-length 6 password validation, enter key submission, loading spinner (`ImSpinner6`), disabled states during submit, forgot password modal, and redirect if already authenticated.
   - `SignUp.jsx`: Added `confirmPassword` field, min-length 6 validation, password matching validation, loading state with spinner, and disabled buttons.
   - `SignUp.scss`: Added `.loaderIcon` spin animation and disabled button styling.

5. **User Profile Component (`src/component/User/Profile.jsx` & `Profile.scss`)**:
   - Tab 1 ("Thông tin cá nhân"): Displays email (readonly), role badge (`QUẢN TRỊ VIÊN` vs `THÍ SINH`), username input, avatar preview, file upload handler with validation (< 3MB, image MIME type), loading state, and Redux sync via `updateProfile`.
   - Tab 2 ("Đổi mật khẩu"): Current password, new password (>= 6 chars), and confirmation password with show/hide password toggles, distinct new password validation, and loading states.

6. **Route Guard (`src/component/Admin/Auth/ProtectedRoute.jsx`)**:
   - Provides role-based and authentication route guarding wrapping any child route.

---

## 2. Logic Chain

1. **Token Refresh Synchronization**:
   When access token expires, multiple API calls may trigger simultaneously. By tracking `isRefreshing` and maintaining a `failedQueue` array of pending Promises, only a single refresh request is executed against the backend. All queued requests are paused and automatically retried once the new access token is received and committed to Redux.
2. **Backward & Forward Compatibility**:
   Different parts of the codebase access `account.roles` (e.g. `Nav.jsx`), while specs mention `account.role` and `account.token`. By populating both `role` and `roles`, `token` and `access_token`, and `auth: true` in `userReducer.jsx`, zero breaking changes were introduced.
3. **Graceful Network & Fallback Support**:
   Both `Login.jsx` and `SignUp.jsx` first invoke the backend endpoints through the proxy (`/api/v1/auth/...`), fall back to `/api/v1/...`, and fall back to the mock service layer if a network refusal or offline backend is detected. This ensures the frontend operates seamlessly both with and without the backend running.

---

## 3. Caveats

- **Route Integration into `Layout.js`**: `Layout.js` is owned exclusively by the Orchestrator. Worker 1 has created `src/component/Admin/Auth/ProtectedRoute.jsx` and `src/component/User/Profile.jsx`. The Orchestrator should register the `/profile` route and wrap `/admin` with `<ProtectedRoute requiredRole="ADMIN">` in `Layout.js`.
- **Backend Aliases**: Backend (Wave C) should provide `/api/v1/auth/refresh` or `/api/v1/refresh`, both of which are supported by the Axios interceptor.

---

## 4. Conclusion

All deliverables specified in `DISPATCH.md` have been implemented:
1. Login & SignUp form validation, loading states, error toasts, min-length 6 checks, password confirmation.
2. Axios token interceptor with auto Bearer injection, HTTP 401 interception, refresh token mutex/queue, and retry.
3. Redux `userReducer` updated with `FETCH_USER_LOGIN_SUCCESS`, `USER_LOGOUT`, `UPDATE_USER_PROFILE`, `REFRESH_TOKEN_SUCCESS`.
4. `useAuth` custom hook created with user info, roles, helpers (`isAdmin`, `isUser`), and action dispatchers.
5. User `Profile.jsx` created with tabbed personal info view/edit, avatar preview/upload, and change password functionality.

**Build Verification:** `npm run build` executed successfully with exit code 0, generating production bundles with 0 warnings in any Worker 1 owned files.

---

## 5. Verification Method

1. **Production Build Compilation**:
   Run:
   ```powershell
   npm run build
   ```
   *Expected outcome:* Build succeeds with exit code 0. No warnings or errors originating from `src/component/Admin/Auth/**`, `src/hooks/useAuth.js`, `src/component/User/Profile.*`, `src/component/actions/redux/userReducer.*`, or `src/util/axiosCutomes.*`.

2. **File Inspection**:
   - Inspect `src/component/util/axiosCutomes.jsx` to verify Bearer header injection and 401 refresh queue logic.
   - Inspect `src/hooks/useAuth.js` to verify exposed auth API.
   - Inspect `src/component/User/Profile.jsx` for info edit and password change tabs.
   - Inspect `src/component/actions/redux/userReducer.jsx` for all 4 action types.
