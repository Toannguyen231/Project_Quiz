import ModalCreateUser from "./ModalCreateUser.jsx";
import '../Content/ManageUser.scss'
import { FcPlus } from "react-icons/fc"
import { useState, useEffect } from "react";
import Tables from "./Tables.jsx";
import ModalUpdateUser from "./ModalUpdateUser.jsx";
import { getAllUsers, getPageUserWithPage } from '../../sevices/apiService.jsx'
import ViewUser from '../Content/ViewUser.jsx'
import DeleteUser from "./DeleteUser.jsx";
import TableUserPagination from "./TableUserPagination.jsx";
const ManagerUser = (props) => {
    const LIMIT_USER = 6;
    const [showModalCreateUser, setShowModalCreateUser] = useState(false);
    const [showModalUpdateUser, setShowModalUpdateUser] = useState(false);
    const [showViewUser, setShowViewUser] = useState(false);
    const [showDeleteUser, setShowDeleteUser] = useState(false);
    const [ListUsers, setListUsers] = useState([]);
    const [dataUpdate, setDataUpdate] = useState({});
    const [dataDelete, setDataDelete] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        featchListUserWithPage(1);
    }, []);

    const featchListUser = async () => {
        try {
            let res = await getAllUsers();
            if (res && res.data && res.data.EC === 0) {
                setListUsers(res.data.DT || []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách người dùng:", error);
        }
    };

    const featchListUserWithPage = async (page) => {
        try {
            let res = await getPageUserWithPage(page, LIMIT_USER);
            if (res && res.data && res.data.EC === 0) {
                setListUsers(res.data.DT.users || []);
                setTotalPages(res.data.DT.totalPages || 0);
            }
        } catch (error) {
            console.error("Lỗi phân trang người dùng:", error);
        }
    };


    const handleClinkBtnUpdate = (user) => {
        setShowModalUpdateUser(true)
        setDataUpdate(user);
    }

    const handleViewBtnUpdate = (user) => {
        setShowViewUser(true);
        setDataUpdate(user);
    }

    const handleDeleteBtnUpdate = (user) => {
        setShowDeleteUser(true);
        setDataDelete(user);
    }

    const resetUpdateUser = () => {
        setDataUpdate({});
    };

    return (

        <div className="manager-user-container">
            <div className="manager-user-header">
                <h2>Manager User</h2>
            </div>

            <div className="manager-user-main">
                <div className="manager-add-user">
                    <button className="add-user btn btn-primary" onClick={() => setShowModalCreateUser(true)}>
                        <FcPlus />
                        Add new user
                    </button>
                </div>

                <div className="table-user-container">
                    <TableUserPagination
                        ListUsers={ListUsers}
                        handleClinkBtnUpdate={handleClinkBtnUpdate}
                        handleViewBtnUpdate={handleViewBtnUpdate}
                        handleDeleteBtnUpdate={handleDeleteBtnUpdate}
                        featchListUserWithPage={featchListUserWithPage}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                    {/* <Tables
                        ListUsers={ListUsers}
                        handleClinkBtnUpdate={handleClinkBtnUpdate}
                        handleViewBtnUpdate={handleViewBtnUpdate}
                        handleDeleteBtnUpdate={handleDeleteBtnUpdate}
                    /> */}
                </div>
                <ModalCreateUser
                    show={showModalCreateUser}
                    setShow={setShowModalCreateUser}
                    featchListUser={featchListUser}
                    featchListUserWithPage={featchListUserWithPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                <ModalUpdateUser
                    show={showModalUpdateUser}
                    setShow={setShowModalUpdateUser}
                    dataUpdate={dataUpdate}
                    featchListUser={featchListUser}
                    resetUpdateUser={resetUpdateUser}
                    featchListUserWithPage={featchListUserWithPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                <ViewUser
                    show={showViewUser}
                    setShow={setShowViewUser}
                    dataUpdate={dataUpdate}
                    resetUpdateUser={resetUpdateUser}
                    featchListUser={featchListUser}
                    featchListUserWithPage={featchListUserWithPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                <DeleteUser
                    show={showDeleteUser}
                    setShow={setShowDeleteUser}
                    dataDelete={dataDelete}
                    resetUpdateUser={resetUpdateUser}
                    featchListUser={featchListUser}
                    featchListUserWithPage={featchListUserWithPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
}

export default ManagerUser;