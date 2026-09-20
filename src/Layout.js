import React from 'react';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import Admin from './component/Admin/Admin.jsx';
import Home from './component/Home/Home.jsx';
import ManagerUser from './component/Admin/Content/ManagerUser.jsx';
import DashBoard from './component/Admin/Content/DashBoard.jsx';
import Login from './component/Admin/Auth/Login.jsx';
import SignUp from './component/Admin/Auth/SignUp.jsx';
import 'nprogress/nprogress.css';
import ListQuiz from './component/User/ListQuiz';
import Detail from './component/User/DetailQuiz';
import ManageQuiz from './component/Admin/Content/Quiz/ManageQuiz.jsx';
import Questions from './component/Admin/Content/Question/Questions.jsx';
import MascotCompanion from './component/Common/MascotCompanion';

const NotFound = () => {
    return (
        <div className="container mt-5 text-center p-5 bg-white rounded-4 shadow-sm border">
            <h1 className="display-4 fw-bold text-primary">404</h1>
            <h4 className="fw-bold mb-3">Không Tìm Thấy Trang Yêu Cầu</h4>
            <p className="text-muted mb-4">Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
            <a href="/" className="btn btn-primary px-4 py-2 rounded-pill fw-bold">
                Về Trang Chủ ➜
            </a>
        </div>
    );
};

const Layout = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Home />} />
                    <Route path="user" element={<ListQuiz />} />
                </Route>
                <Route path="/quiz/:id" element={<Detail />} />
                <Route path="admin" element={<Admin />}>
                    <Route index element={<DashBoard />} />
                    <Route path="manageruser" element={<ManagerUser />} />
                    <Route path="manageQuiz" element={<ManageQuiz />} />
                    <Route path="manageQuestions" element={<Questions />} />
                </Route>
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <MascotCompanion />
        </>
    );
};

export default Layout;
