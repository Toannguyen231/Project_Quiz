# Handoff Report: Auth & User Codebase Survey for QuizMaster

> **Agent:** Auth Codebase Surveyor (`survey_auth_explorer`)  
> **Target:** Orchestrator (Parent: `11542a74-a4bf-47fe-9863-729b2d2b58f1`) & Wave A Worker 1 (Auth)  
> **Working Directory:** `D:\test-demo-react\Quiz-question\.agents\survey_auth_explorer`  
> **Timestamp:** 2026-09-20T17:08:00Z  
> **Type:** Hard Handoff (Task Complete)

---

## 1. Observation

### 1.1 Directory & File Layout
- **Auth Components (`src/component/Admin/Auth/`)**:
  - `Login.jsx` (208 lines, 8,657 bytes): React component with form state for `email`, `password`, `isLoading`. Uses `validateEmail` regex. Includes demo buttons for Thí sinh (`user@gmail.com`/`user123`) and Admin (`admin@gmail.com`/`admin123`). Calls `postLogin(loginEmail, loginPassword)`. On success (`res.data.EC === 0`), dispatches `FETCH_USER_LOGIN_SUCCESS` with `payload: res.data`.
  - `SignUp.jsx` (169 lines, 6,424 bytes): Form with `userName`, `email`, `password`. Calls `postCreateSignUp(userName, email, password)`. Redirects to `/login` on success.
  - `Login.scss` & `SignUp.scss`: Styling present.
- **Service & Network Layer**:
  - `src/component/util/axiosCutomes.jsx` (49 lines, 1,727 bytes): Axios instance creation with `baseURL: '/api/v1'`, `timeout: 10000`. Request interceptor attaches `config.headers.Authorization = 'Bearer ' + access_token` from `store.getState()?.user?.account?.access_token`. Response interceptor only calls `NProgress.done()`. **No 401 handling, no token refresh logic, no `withCredentials: true`**.
  - `src/util/axiosCutomes.jsx` (2 lines, 58 bytes): Merely re-exports `src/component/util/axiosCutomes`.
  - `src/component/sevices/apiService.jsx` (262 lines, 7,809 bytes): Hybrid service layer wrapping calls with fallback to `mockService.js`.
    - Line 46: `instance.post('http://localhost:8081/api/v1/login', data)` (hardcoded to port 8081, bypassing `/api/v1` proxy!).
    - Line 61: `instance.post('http://localhost:8081/api/v1/register', data)` (hardcoded to port 8081!).
    - Line 79 & 90: Similarly hardcoded to `http://localhost:8081`.
    - Missing methods: No `postRefreshToken`, `postLogout`, `getUserProfile`, `putUpdateProfile`, `postChangePassword`, `postForgotPassword`.
- **Redux Store Architecture**:
  - `package.json`: Contains `@reduxjs/toolkit: ^2.11.0`, `redux-persist: 6.0.0`, `react-redux: ^7.2.8`.
  - `src/component/actions/store.jsx` (21 lines): Uses legacy Redux `createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)))`. Persists root with `storage: localStorage`.
  - `src/component/actions/Actions.jsx` (31 lines):
    - Line 4: `export const FETCH_USER_LOGIN_FAIL = 'FETCH_USER_LOGOUT_FAIL';` (inconsistent naming).
    - Lacks explicit actions for `USER_LOGOUT`, `UPDATE_USER_PROFILE`, `REFRESH_ACCESS_TOKEN`.
  - `src/component/actions/redux/userReducer.jsx` (46 lines):
    - `INITIAL_STATE = { account: { access_token: '', refresh_token: '', username: '', email: '', roles: '' }, isAuthenticated: false }`.
    - `account` lacks `image` field.
    - Only handles `FETCH_USER_LOGIN_SUCCESS` and `FETCH_USER_LOGIN_FAIL`.
  - `src/component/actions/userAction`: Empty 0-byte orphan file.
- **Routing & Route Guards**:
  - `src/Layout.js` (57 lines):
    - Routes defined: `/` (App -> Home, user -> ListQuiz), `/quiz/:id` (Detail), `/admin` (Admin -> DashBoard, manageruser, manageQuiz, manageQuestions), `/login` (Login), `/signup` (SignUp), `*` (NotFound).
    - **Zero route guards**. All routes (including `/admin/*` and `/quiz/:id`) are public and directly accessible.
    - No `/profile` or `/change-password` routes.
  - `src/component/Header/Nav.jsx` (230 lines):
    - Reads `account` and `isAuthenticated` from Redux `state.user`.
    - Line 62: `const isAdmin = account?.roles === 'ADMIN';` (case-sensitive check).
    - Line 50: `handleClickLogOut` dispatches `{ type: 'FETCH_USER_LOGOUT_FAIL', payload: {} }`.
    - Dropdown shows "Bài thi của tôi", "Quản trị hệ thống" (if admin), "Đăng xuất". No "Thông tin tài khoản" (Profile) link.
- **Profile & Account Management**:
  - `src/component/User/User.jsx`: Dummy placeholder ("user component").
  - `Profile.jsx`: Does NOT exist anywhere in the codebase.
- **Backend Current State**:
  - `server/index.js` (24 lines): Only defines `GET /api/v1/health`. Database SQLite initialized in WAL mode, but schema tables and auth routes are not yet created.
- **Test Baseline**:
  - Executed `npm test -- --watchAll=false`: Exited with code 1. `App.test.js` failed because `<App />` mounts `<Nav />`, which requires a Redux `<Provider>` and React Router context.

---

## 2. Logic Chain

1. **Token Flow Breakdown**:
   - `Login.jsx` calls `postLogin` -> sends FormData to `http://localhost:8081/api/v1/login`. Because port 8081 is dead, `isNetworkError` catches it and falls back to `mockLogin` in `mockService.js`.
   - `mockLogin` returns a fake token `mock_token_1_...`.
   - Redux stores `access_token` and `refresh_token` in `state.user.account`, persisted to `localStorage`.
   - `axiosCutomes.jsx` reads `store.getState()?.user?.account?.access_token` and attaches `Authorization: Bearer <token>`.
   - However, when the access token expires and backend responds with HTTP 401, `axiosCutomes.jsx` does not intercept 401: the error propagates uncaught, requests fail, and the user is neither refreshed nor gracefully logged out.
2. **Missing Security & Role Authorization**:
   - Because `Layout.js` directly mounts `<Admin />` at `/admin` without any wrapper component, any unauthenticated visitor or candidate (`USER` role) can view the admin console and mutate quizzes or users (if mock or backend endpoints are open).
   - Creating a `ProtectedRoute` / `RoleRoute` component is required to protect `/admin` (requiring `role === 'ADMIN'`) and protected candidate paths (`/quiz/:id`, `/profile`, requiring `isAuthenticated === true`).
3. **Redux Modernization vs Stability**:
   - `@reduxjs/toolkit` is already in `package.json`.
   - `PLAN-SPEC-Auth.md` §2 allows creating `src/store/authSlice.js` or updating `src/component/actions/redux/userReducer.jsx`.
   - Updating `userReducer.jsx` or creating `authSlice.js` alongside a custom `useAuth` hook will encapsulate role checks, token updates, profile edits, and logout, without breaking existing selectors in `Nav.jsx` and `Home.jsx` (`state.user.account`, `state.user.isAuthenticated`).
4. **File Ownership Compliance (`PLAN.md` §5)**:
   - `package.json`, `App.js`, `Layout.js` are owned by Orchestrator / Tech-Lead.
   - Worker 1 (Auth) can implement `ProtectedRoute.jsx`, `useAuth.js`, `Profile.jsx`, update `axiosCutomes.jsx`, `apiService.jsx`, `Login.jsx`, `SignUp.jsx`, `userReducer.jsx`.
   - Worker 1 provides the exact diff for `Layout.js` to Orchestrator.

---

## 3. Caveats

1. **Legacy CRA Build Flag**: React 17 + react-scripts 4 on Node 24 requires `--openssl-legacy-provider`. Scripts in `package.json` already have this configured.
2. **Directory Name `sevices`**: The folder is spelled `src/component/sevices`. Per invariant rules, it must NOT be renamed to avoid breaking imports across all other modules.
3. **Cookie vs Storage Refresh Token**: `PLAN-SPEC-Auth.md` states: "Lưu refresh token trong httpOnly cookie (backend lo) — frontend chỉ giữ accessToken". If backend sets an httpOnly cookie on login/refresh, axios instance MUST have `withCredentials: true`. If backend returns `refresh_token` in the JSON body, frontend must support both mechanisms cleanly.
4. **Endpoint Aliases**: Backend contract should support both `/api/v1/auth/login` AND `/api/v1/login` (same for register) to prevent breaking legacy frontend components while adopting standard REST paths.

---

## 4. Conclusion & Actionable Survey Results

### 4.1 Features Discovered & Status Matrix

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth UI | Login Form | Email + password login with demo quick-buttons | `email`, `password` | Dispatches user data to Redux, redirects to `/` | Shows toast error on invalid format or API error | `src/component/Admin/Auth/Login.jsx` |
| 2 | Auth UI | Sign Up Form | Registration form | `userName`, `email`, `password` | API call to register, redirects to `/login` | Shows toast error on duplicate email or empty inputs | `src/component/Admin/Auth/SignUp.jsx` |
| 3 | Network | Bearer Token Injection | Axios request interceptor attaches Bearer token | `store.getState().user.account.access_token` | `Authorization` HTTP header | None (skips if token absent) | `src/component/util/axiosCutomes.jsx` |
| 4 | Network | Progress Bar | NProgress bar on API requests | Axios request/response lifecycle | UI loading bar at top of screen | Clears progress on error | `src/component/util/axiosCutomes.jsx` |
| 5 | Network | Hybrid Mock Fallback | If network error / backend offline, fallback to localStorage mock | API request params | Mock JSON matching backend `{ EC, DT, EM }` | Throws error if not a network failure | `src/component/sevices/apiService.jsx` |
| 6 | State | User Session Persistence | Redux Persist saves auth slice to localStorage | Redux actions | LocalStorage `persist:root` | None | `src/component/actions/store.jsx` |
| 7 | Navigation | Role-based Nav Header | Shows Admin link only if role is ADMIN; shows login/signup or user dropdown | Redux `account.roles`, `isAuthenticated` | Conditionally rendered header elements | Defaults to unauthenticated buttons | `src/component/Header/Nav.jsx` |
| 8 | Navigation | Daily Streak Tracker | Displays gamified study streak in header | LocalStorage streak event | Flame badge with streak count | Graceful fallback to 0 | `src/component/Header/Nav.jsx` |

### 4.2 Edge Cases Discovered

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Login API URL | Calling `postLogin` with local backend running on 3001 | Requests `http://localhost:8081/api/v1/login`, fails network check, falls back to mock instead of calling real backend on 3001 via proxy. |
| 2 | Token Expiry | Access token expires (backend returns 401) | No interceptor catches 401; page fails silently or breaks; user is not redirected to login. |
| 3 | Admin Navigation | Guest accesses `http://localhost:3002/admin` directly | Page renders full Admin dashboard without any login challenge or permission denied warning. |
| 4 | Candidate Exam | Guest accesses `http://localhost:3002/quiz/1` directly | Page renders exam details without requiring candidate login. |
| 5 | Role Casing | Backend returns `roles: 'admin'` (lowercase) | `Nav.jsx` line 62 checks `=== 'ADMIN'`; evaluates to `false`, hiding Admin links for valid admin users. |
| 6 | Sign Up Validation | Submitting password with 1 character | Accepted by `SignUp.jsx` (only checks `!password`), violating min length 6 spec requirement. |
| 7 | Unit Testing | Running `npm test -- --watchAll=false` | Crashes on `<Header>` because `<App>` does not provide Redux `<Provider>` in test. |

---

### 4.3 Exact Gaps Against `PLAN-SPEC-Auth.md`

| Requirement | Spec Clause | Current State | Required Work for Wave A |
|---|---|---|---|
| **Login Validation** | §4.1: Email format, required, min length 6 | Only checks email format and `!password` | Add min length 6 validation; display error toast |
| **Login API Endpoint** | §4.1: `POST /api/v1/auth/login` | Hardcoded `http://localhost:8081/api/v1/login` with `delay: 5000` | Change to relative `/api/v1/auth/login` (fallback `/api/v1/login`), remove unnecessary 5s delay |
| **SignUp Form Fields** | §4.1: name, email, password, **confirm password** | Only has `userName`, `email`, `password` | Add `confirmPassword` input, validate `password === confirmPassword`, min length 6 |
| **SignUp UX** | §4.1: Disable button while submitting, spinner | No `isLoading` state in `SignUp.jsx` | Add `isLoading`, disabled button state, `ImSpinner6` icon |
| **Axios 401 Interceptor** | §4.2: Catch 401 -> `POST /api/v1/auth/refresh` -> retry | Only calls `NProgress.done()`; no 401 handler | Implement 401 interceptor, token refresh mutex/queue, retry original request |
| **Refresh Failure Handling** | §4.2: Clear state, redirect to `/login` | None | Dispatch logout action, clear persist, navigate to `/login` |
| **Axios Credentials** | §4.2: httpOnly cookie support | `withCredentials` not set | Set `instance.defaults.withCredentials = true` |
| **Role Helper & Hook** | §4.3: `useAuth` hook with `isAdmin()`, `isUser()` | No `useAuth.js` hook exists | Create `src/hooks/useAuth.js` with role helpers, login, logout, profile handlers |
| **Route Guards** | §4.3: Role guard redirecting non-admin to `/` | No route guards in `Layout.js` | Create `src/routes/ProtectedRoute.jsx` (or under auth) and propose integration into `Layout.js` |
| **User Profile Page** | §4.4: View/edit name, email, avatar | No profile component or route | Create `src/component/User/Profile.jsx` with tabs: Profile Info & Change Password |
| **Change Password Form** | §4.4: `POST /api/v1/auth/change-password` | Non-existent | Add change password form to `Profile.jsx` and corresponding API in `apiService.jsx` |
| **Forgot Password** | §4.5: UI reset email | Non-existent | Add "Quên mật khẩu?" modal or link in `Login.jsx` |

---

### 4.4 File Ownership & Proposed Modifications for Wave A Auth

#### A. Files Directly Owned & To Be Modified by Worker 1 (Auth):
1. `src/component/util/axiosCutomes.jsx` (and `src/util/axiosCutomes.jsx`):
   - Set `withCredentials: true`.
   - Add response error interceptor for HTTP 401:
     - Implement refresh token queue / `isRefreshing` lock.
     - Call `postRefreshToken()`.
     - Update Redux store access token.
     - Retry queued requests with new token.
     - On refresh error, clear Redux auth and redirect to `/login`.
2. `src/component/sevices/apiService.jsx`:
   - Clean up hardcoded `http://localhost:8081` URLs to relative `/api/v1/...`.
   - Add auth endpoints:
     - `postLogin(email, password)` -> `instance.post('/auth/login', { email, password })` (with fallback to `/login`)
     - `postRegister(username, email, password)` -> `instance.post('/auth/register', { username, email, password })`
     - `postRefreshToken(refreshToken)` -> `instance.post('/auth/refresh', { refresh_token: refreshToken })`
     - `postLogout()` -> `instance.post('/auth/logout')`
     - `getUserProfile()` -> `instance.get('/users/me')`
     - `putUpdateProfile(formDataOrJson)` -> `instance.put('/users/me', formDataOrJson)`
     - `postChangePassword(currentPassword, newPassword)` -> `instance.post('/auth/change-password', { currentPassword, newPassword })`
     - `postForgotPassword(email)` -> `instance.post('/auth/forgot-password', { email })`
3. `src/component/Admin/Auth/Login.jsx`:
   - Add min-length 6 validation for password.
   - Add "Quên mật khẩu?" helper/modal.
   - Redirect to `/` if user is already authenticated.
4. `src/component/Admin/Auth/SignUp.jsx`:
   - Add `confirmPassword` input and state.
   - Add validation: min length 6, passwords match.
   - Add `isLoading` state, spinner, button disable during submission.
5. `src/component/actions/redux/userReducer.jsx` (and `Actions.jsx`):
   - Add `image` to `INITIAL_STATE.account`.
   - Add actions: `USER_LOGOUT`, `UPDATE_USER_PROFILE`, `REFRESH_TOKEN_SUCCESS`.
   - Ensure backward compatibility with `FETCH_USER_LOGIN_SUCCESS` / `FETCH_USER_LOGOUT_FAIL`.
6. `src/hooks/useAuth.js` (NEW file):
   - Custom hook exposing `{ user, account, isAuthenticated, isAdmin, isUser, login, logout, updateProfile }`.
7. `src/component/User/Profile.jsx` (NEW file):
   - Candidate & Admin profile management:
     - Tab 1: Profile info (view email, edit username, upload avatar preview).
     - Tab 2: Change password (current password, new password, confirm new password).
8. `src/component/Admin/Auth/ProtectedRoute.jsx` (NEW file):
   - Role-based and authentication route guard component.
9. `src/component/Admin/Auth/ForgotPasswordModal.jsx` (NEW file):
   - Modal for forgot password request.

#### B. Proposed Changes for Orchestrator (`Layout.js` & `Nav.jsx`):
Since `Layout.js` is owned by Orchestrator, Worker 1 submits the following proposed route integration:
```jsx
// Proposed additions to Layout.js:
import ProtectedRoute from './component/Admin/Auth/ProtectedRoute';
import Profile from './component/User/Profile';

// Route wrappers:
<Route path="/" element={<App />}>
    <Route index element={<Home />} />
    <Route path="user" element={<ProtectedRoute><ListQuiz /></ProtectedRoute>} />
    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
</Route>
<Route path="/quiz/:id" element={<ProtectedRoute><Detail /></ProtectedRoute>} />
<Route path="admin" element={
    <ProtectedRoute requiredRole="ADMIN">
        <Admin />
    </ProtectedRoute>
}>
    <Route index element={<DashBoard />} />
    <Route path="manageruser" element={<ManagerUser />} />
    <Route path="manageQuiz" element={<ManageQuiz />} />
    <Route path="manageQuestions" element={<Questions />} />
</Route>
```
And for `Nav.jsx`:
- Add "Hồ sơ cá nhân" item in the user dropdown navigating to `/profile`.

---

### 4.5 Backend API Contract Requirements (for Agent-Backend / Wave C)

All endpoints must be scoped under `/api/v1`. Backend should also alias `/api/v1/login` -> `/api/v1/auth/login` and `/api/v1/register` -> `/api/v1/auth/register` for backward compatibility.

| Method | Endpoint | Request Body | Response Body (`{ EC, EM, DT }`) | Auth Required |
|---|---|---|---|---|
| **POST** | `/api/v1/auth/login` | `{ "email": "...", "password": "..." }` | `EC: 0`, `EM: "Đăng nhập thành công"`, `DT: { "access_token": "...", "refresh_token": "...", "username": "...", "email": "...", "roles": "USER"|"ADMIN", "image": "..." }` | Public |
| **POST** | `/api/v1/auth/register` | `{ "username": "...", "email": "...", "password": "..." }` | `EC: 0`, `EM: "Đăng ký thành công"`, `DT: null` | Public |
| **POST** | `/api/v1/auth/refresh` | `{ "refresh_token": "..." }` (or via cookie) | `EC: 0`, `EM: "Refresh thành công"`, `DT: { "access_token": "...", "refresh_token": "..." }` | Public / Refresh Token |
| **POST** | `/api/v1/auth/logout` | None (or `{ "refresh_token": "..." }`) | `EC: 0`, `EM: "Đăng xuất thành công"`, `DT: null` | Bearer Token |
| **GET** | `/api/v1/users/me` | None | `EC: 0`, `EM: "Success"`, `DT: { "id": 1, "username": "...", "email": "...", "roles": "...", "image": "..." }` | Bearer Token |
| **PUT** | `/api/v1/users/me` | `{ "username": "...", "image": "..." }` (or `multipart/form-data`) | `EC: 0`, `EM: "Cập nhật thành công"`, `DT: { "username": "...", "image": "..." }` | Bearer Token |
| **POST** | `/api/v1/auth/change-password` | `{ "currentPassword": "...", "newPassword": "..." }` | `EC: 0`, `EM: "Đổi mật khẩu thành công"`, `DT: null` | Bearer Token |
| **POST** | `/api/v1/auth/forgot-password` | `{ "email": "..." }` | `EC: 0`, `EM: "Email hướng dẫn đã được gửi"`, `DT: null` | Public |

---

## 5. Verification Method

To independently verify these findings:
1. **Inspect Network & Endpoints**:
   - Run `grep -n "http://localhost:8081" src/component/sevices/apiService.jsx` -> confirm lines 46, 61, 79, 90.
   - View `src/component/util/axiosCutomes.jsx` -> verify lack of 401 error handler in `instance.interceptors.response.use`.
2. **Inspect Route Guards**:
   - View `src/Layout.js` -> verify `<Admin />` and `<Detail />` are mounted without any wrapper or auth check.
3. **Inspect Profile Component**:
   - Run `fd -e jsx Profile src/` -> returns 0 results, confirming absence.
4. **Inspect Redux Actions**:
   - View `src/component/actions/Actions.jsx` line 4 -> observe `FETCH_USER_LOGIN_FAIL = 'FETCH_USER_LOGOUT_FAIL'`.
5. **Run Baseline Tests**:
   - Run `npm test -- --watchAll=false` -> observe crash in `App.test.js` due to missing Redux Provider context in `<Header>`.
