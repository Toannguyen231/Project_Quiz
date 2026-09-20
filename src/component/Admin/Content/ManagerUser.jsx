import React, { useState, useEffect, useCallback, useRef } from "react";
import ModalCreateUser from "./ModalCreateUser.jsx";
import './ManageUser.scss';
import { FcPlus } from "react-icons/fc";
import { FaSearch, FaTimes, FaUserFriends, FaSyncAlt } from "react-icons/fa";
import ModalUpdateUser from "./ModalUpdateUser.jsx";
import { getAllUsers, getPageUserWithPage } from '../../sevices/apiService.jsx';
import instance from '../../util/axiosCutomes';
import ViewUser from './ViewUser.jsx';
import DeleteUser from "./DeleteUser.jsx";
import TableUserPagination from "./TableUserPagination.jsx";
import { toast } from "react-toastify";

const ManagerUser = () => {
    const LIMIT_USER = 6;
    const [showModalCreateUser, setShowModalCreateUser] = useState(false);
    const [showModalUpdateUser, setShowModalUpdateUser] = useState(false);
    const [showViewUser, setShowViewUser] = useState(false);
    const [showDeleteUser, setShowDeleteUser] = useState(false);
    const [ListUsers, setListUsers] = useState([]);
    const [dataUpdate, setDataUpdate] = useState({});
    const [dataDelete, setDataDelete] = useState({});
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);

    // Search state & debouncing
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const debounceTimerRef = useRef(null);

    // Debounce search input (300ms)
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setCurrentPage(1); // Reset to page 1 on new search term
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchInput]);

    const featchListUser = async () => {
        try {
            let res = await getAllUsers();
            if (res && res.data && res.data.EC === 0) {
                const users = res.data.DT || [];
                setListUsers(users);
                setTotalRows(users.length);
                setTotalPages(Math.ceil(users.length / LIMIT_USER) || 1);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách người dùng:", error);
        }
    };

    const featchListUserWithPage = useCallback(async (page, search = debouncedSearch) => {
        setLoading(true);
        try {
            // First attempt: call backend API with search query parameter
            let res;
            try {
                const url = `/api/v1/participant?page=${page}&limit=${LIMIT_USER}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
                res = await instance.get(url);
            } catch (err) {
                // Fallback to standard service call
                res = await getPageUserWithPage(page, LIMIT_USER);
            }

            if (res && res.data && res.data.EC === 0 && res.data.DT) {
                let users = res.data.DT.users || [];
                let total = res.data.DT.totalRows ?? users.length;
                let pages = res.data.DT.totalPages ?? Math.ceil(total / LIMIT_USER);

                // Client-side fallback filter if backend didn't filter by search term
                if (search) {
                    const term = search.toLowerCase();
                    const clientFiltered = users.filter(u =>
                        (u.username && u.username.toLowerCase().includes(term)) ||
                        (u.email && u.email.toLowerCase().includes(term))
                    );

                    // If backend didn't do search filtering (meaning user count is unchanged and unmatching rows exist)
                    if (clientFiltered.length < users.length) {
                        users = clientFiltered;
                        pages = Math.ceil(users.length / LIMIT_USER) || 1;
                        total = users.length;
                    }
                }

                setListUsers(users);
                setTotalPages(pages || 1);
                setTotalRows(total);
            }
        } catch (error) {
            console.error("Lỗi phân trang người dùng:", error);
            toast.error("Không thể tải danh sách thí sinh");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, LIMIT_USER]);

    useEffect(() => {
        featchListUserWithPage(currentPage, debouncedSearch);
    }, [featchListUserWithPage, currentPage, debouncedSearch]);

    const handleClinkBtnUpdate = (user) => {
        setShowModalUpdateUser(true);
        setDataUpdate(user);
    };

    const handleViewBtnUpdate = (user) => {
        setShowViewUser(true);
        setDataUpdate(user);
    };

    const handleDeleteBtnUpdate = (user) => {
        setShowDeleteUser(true);
        setDataDelete(user);
    };

    const resetUpdateUser = () => {
        setDataUpdate({});
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setDebouncedSearch('');
        setCurrentPage(1);
    };

    return (
        <div className="manager-user-container p-3 p-md-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-2 border-bottom">
                <div>
                    <h3 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                        👥 Quản Lý Thí Sinh &amp; Người Dùng
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: 0 }}>
                        Xem, tìm kiếm, phân trang và quản lý tài khoản thí sinh / quản trị viên.
                    </p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                    style={{ borderRadius: '8px', padding: '9px 18px', fontWeight: '500' }}
                    onClick={() => setShowModalCreateUser(true)}
                >
                    <FcPlus size={18} />
                    <span>Thêm người dùng mới</span>
                </button>
            </div>

            {/* Control Bar: Search input + Stats */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-6 col-lg-5">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Tìm kiếm theo tên hoặc email thí sinh..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    style={{ boxShadow: 'none' }}
                                />
                                {searchInput && (
                                    <button
                                        className="btn btn-outline-secondary border-start-0"
                                        type="button"
                                        onClick={handleClearSearch}
                                        title="Xóa tìm kiếm"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-lg-7 d-flex justify-content-md-end align-items-center gap-3">
                            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                <FaUserFriends className="me-1 text-primary" />
                                {debouncedSearch ? (
                                    <span>
                                        Tìm thấy <strong>{totalRows}</strong> kết quả cho "{debouncedSearch}"
                                    </span>
                                ) : (
                                    <span>
                                        Tổng số: <strong>{totalRows}</strong> thí sinh (Trang {currentPage}/{totalPages})
                                    </span>
                                )}
                            </div>
                            <button
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                onClick={() => featchListUserWithPage(currentPage, debouncedSearch)}
                                disabled={loading}
                                title="Tải lại danh sách"
                            >
                                <FaSyncAlt className={loading ? 'fa-spin' : ''} />
                                <span className="d-none d-sm-inline">Tải lại</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="card-body p-0">
                    <TableUserPagination
                        ListUsers={ListUsers}
                        handleClinkBtnUpdate={handleClinkBtnUpdate}
                        handleViewBtnUpdate={handleViewBtnUpdate}
                        handleDeleteBtnUpdate={handleDeleteBtnUpdate}
                        featchListUserWithPage={featchListUserWithPage}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Modals */}
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
            />

            <DeleteUser
                show={showDeleteUser}
                setShow={setShowDeleteUser}
                dataDelete={dataDelete}
                featchListUserWithPage={featchListUserWithPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
    );
};

export default ManagerUser;