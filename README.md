<div align="center">

# 🧠 Project Quiz (QuizMaster)

### A Modern Full-Featured Online Examination, Quiz Management & Assessment Platform

Built with React 17, Redux Toolkit, React Router v6, Bootstrap 5 & Axios

[![React](https://img.shields.io/badge/React-17.0.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-Persisted_State-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br />

[💡 Overview](#-project-overview) • [✨ Key Features](#-key-features) • [🏛️ Architecture](#-project-structure) • [🚀 Quick Start](#-getting-started) • [📡 API Reference](#-api-integration) • [👨‍💻 Author](#-author--contact)

</div>

---

## 💡 Project Overview

**Project Quiz** is a comprehensive Single Page Application (SPA) designed for online examinations, academic assessments, and candidate skill evaluations. It delivers two tailored experiences within a single unified platform:

1. **Candidate Assessment Portal**: An interactive, responsive test-taking interface equipped with a real-time countdown timer, question-jumping sidebar, image zoom lightbox, and immediate score breakdown upon submission.
2. **Instructor & Admin Command Center**: A rich dashboard featuring paginated User Management (CRUD), Quiz Creation (with cover image upload & difficulty levels), dynamic Question & Multi-Choice Answer builders, and statistical overview cards.

---

## ✨ Key Features

### 🎓 1. Candidate & Student Experience
- **Interactive Quiz Catalog**: Browse assigned tests with cover banners, task descriptions, and difficulty ratings (Easy, Medium, Hard).
- **Exam Environment**:
  - **Countdown Timer**: Automatically monitors remaining time and triggers submission upon expiration.
  - **Quick-Jump Navigation**: An interactive question grid allowing candidates to jump to any question and track completed vs. pending answers.
  - **Rich Media Questions**: Integrated image viewer with click-to-zoom modal powered by `react-awesome-lightbox`.
  - **Dynamic Multi-Choice Selection**: Supports radio and checkbox options with real-time answer caching in component state.
- **Immediate Score & Diagnostic Review**:
  - Displays total questions, correct answers, incorrect answers, and final percentage score upon submission.
  - Detailed result modal allowing students to review questions and compare their answers against correct solutions.

### 🛡️ 2. Instructor & Admin Management Portal
- **Analytics Dashboard**: Overview metrics displaying real-time system counts: Total Users, Total Quizzes, Total Questions, and Total Answers.
- **User Management (CRUD)**:
  - Paginated user directory (`react-paginate`) with avatar image preview.
  - Create, view, update, and delete users with role assignment (`Admin` vs. `User`).
  - Form validation with interactive feedback toasts (`react-toastify`).
- **Quiz Management**:
  - Create and edit quizzes with titles, descriptions, difficulty classifications, and image uploads (`FormData`).
  - Assign customized quizzes directly to specific user accounts.
- **Dynamic Question & Answer Builder**:
  - Interactive nested form for drafting questions with custom reference diagrams.
  - Add or remove dynamic answer rows with a single click.
  - Toggle `isCorrect` markers per answer option for flexible single or multiple-correct answers.

---

## 🏛️ Project Structure

```
Project_Quiz/
├── public/                     # Static HTML template & favicons
├── src/
│   ├── accets/                 # Brand graphics and background illustrations
│   ├── component/
│   │   ├── Admin/              # Instructor / Admin Portal
│   │   │   ├── Auth/           # Login & Registration authentication forms
│   │   │   ├── Content/
│   │   │   │   ├── DashBoard.jsx      # Analytics overview cards & statistics
│   │   │   │   ├── ManagerUser.jsx    # User CRUD with pagination & modals
│   │   │   │   ├── Quiz/              # Quiz CRUD & participant assignment
│   │   │   │   └── Question/          # Dynamic question & answer builder
│   │   │   └── Admin.jsx       # Collapsible admin layout (React Pro Sidebar)
│   │   ├── User/               # Candidate Exam Portal
│   │   │   ├── ListQuiz.jsx    # Catalog of assigned tests
│   │   │   ├── DetailQuiz.jsx  # Active test-taking runner with countdown
│   │   │   ├── Question.jsx    # Question renderer with image lightbox
│   │   │   └── ModalResult.jsx # Score diagnostic modal
│   │   ├── Header/             # Global navigation bar & session state
│   │   ├── Home/               # Platform landing page
│   │   ├── sevices/            # Axios API service endpoints
│   │   └── util/               # Axios custom client with NProgress interceptors
│   ├── App.js                  # Master application shell
│   ├── Layout.js               # React Router v6 routing definitions
│   └── index.js                # Redux store provider & application bootstrap
├── package.json
└── README.md
```

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Frontend Core** | **React 17.0.2** | Component-driven UI architecture |
| **State Management** | **Redux Toolkit** + **Redux Persist** | Global user authentication & persistent sessions |
| **Navigation & Routing** | **React Router DOM v6.30** | Declarative nested routing with `<Routes>` and `<Outlet>` |
| **Layout & Styling** | **Bootstrap 5.3** + **Sass (SCSS)** | Responsive grid system and customized SCSS stylesheets |
| **Admin Navigation** | **React Pro Sidebar 0.7** | Smooth collapsible sidebar navigation for the admin portal |
| **HTTP Client** | **Axios 0.27** | REST API communication with request/response interceptors |
| **User Feedback** | **React Toastify** + **NProgress** | Notification toasts and sleek top progress bar loaders |
| **Media Viewer** | **React Awesome Lightbox** | Click-to-zoom image viewer for complex question diagrams |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `16.x` or later (tested up to `24.x`)
- **npm**: `8.x` or later
- **Backend**: Integrated Express + SQLite in `server/` (chạy song song qua proxy)

### 2. Clone the Repository
```bash
git clone https://github.com/Toannguyen231/Project_Quiz.git
cd Project_Quiz
```

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Environment Setup
- Frontend configuration: `.env` (mặc định cổng `PORT=3002`)
- Backend configuration: `server/.env` (tham khảo `server/.env.example`, mặc định cổng `PORT=3001`)

### 5. Run Full-Stack Development Server
Chạy đồng thời cả **Backend (Express - 3001)** và **Frontend (React - 3002)**:
```bash
npm run dev
```
- **Backend Healthcheck**: `http://localhost:3001/api/v1/health`
- **Frontend App**: `http://localhost:3002` (mọi request tới `/api/v1/*` được tự động proxy sang backend 3001)

Nếu chỉ muốn chạy riêng frontend:
```bash
npm start
```
Nếu chỉ muốn chạy riêng backend:
```bash
npm run server
```

### 6. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in the `build/` directory.

---

## 📡 API Integration

The application communicates with a REST API server (default base URL: `http://localhost:8081/api/v1`):

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/login` | Authenticate user and store token |
| | `POST` | `/api/v1/register` | Register new participant account |
| **Users** | `GET` | `/api/v1/participant?page={p}&limit={l}` | Paginated participant list |
| | `POST` | `/api/v1/participant` | Create user with avatar upload |
| | `PUT` | `/api/v1/participant` | Update profile information |
| | `DELETE`| `/api/v1/participant` | Remove user account |
| **Quizzes** | `GET` | `/api/v1/quiz-by-participant` | Retrieve assigned tests for candidate |
| | `GET` | `/api/v1/quiz/all` | Retrieve all quizzes (Admin) |
| | `POST` | `/api/v1/quiz` | Create new quiz with image cover |
| | `POST` | `/api/v1/quiz-assign-to-user` | Assign quiz to specific candidate |
| **Exam** | `GET` | `/api/v1/questions-by-quiz?quizId={id}`| Fetch questions and multi-choice options |
| | `POST` | `/api/v1/quiz-submit` | Submit answers and calculate score |
| **Dashboard**| `GET` | `/api/v1/overview` | Fetch overview counts for dashboard cards |

---

## 👨‍💻 Author & Contact

**Nguyễn Ngọc Toàn (Toan Nguyen)**  
*Full-Stack Software Engineer — Specializing in React, Node.js & Real-Time Web Applications*

- 🐙 **GitHub**: [@Toannguyen231](https://github.com/Toannguyen231)
- 💼 **LinkedIn**: [linkedin.com/in/toannguyen231](https://linkedin.com/in/toannguyen231)
- 📬 **Email**: [nguyenngoctoan231@gmail.com](mailto:nguyenngoctoan231@gmail.com)

---

## 📄 License

This project is open-source software licensed under the **MIT License**.