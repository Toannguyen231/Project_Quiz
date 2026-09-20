import React from 'react';
import ReactPaginate from 'react-paginate';
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';

const TableUserPagination = (props) => {
    const {
        ListUsers = [],
        handleClinkBtnUpdate,
        handleViewBtnUpdate,
        handleDeleteBtnUpdate,
        featchListUserWithPage,
        totalPages = 1,
        currentPage = 1,
        setCurrentPage,
        loading = false
    } = props;

    const handlePageClick = async (event) => {
        const nextSelected = event.selected + 1;
        if (setCurrentPage) setCurrentPage(nextSelected);
        if (featchListUserWithPage) await featchListUserWithPage(nextSelected);
    };

    const renderAvatar = (user) => {
        if (user && user.image) {
            const src = user.image.startsWith('data:') || user.image.startsWith('http')
                ? user.image
                : `data:image/jpeg;base64,${user.image}`;
            return (
                <img
                    src={src}
                    alt={user.username || 'Avatar'}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #e2e8f0',
                    }}
                />
            );
        }

        const initial = (user && user.username ? user.username.charAt(0) : 'U').toUpperCase();
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
        const charCode = initial.charCodeAt(0) || 0;
        const bg = colors[charCode % colors.length];

        return (
            <div
                style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: bg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
            >
                {initial}
            </div>
        );
    };

    return (
        <div className="table-user-pagination-wrapper">
            {/* Table wrapped in .table-responsive for mobile responsiveness */}
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr style={{ color: '#475569', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <th scope="col" style={{ width: '70px', textAlign: 'center' }}>ID</th>
                            <th scope="col" style={{ width: '70px', textAlign: 'center' }}>Ảnh</th>
                            <th scope="col">Tên tài khoản</th>
                            <th scope="col">Email</th>
                            <th scope="col" style={{ width: '120px' }}>Vai trò</th>
                            <th scope="col" style={{ width: '220px', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-muted">
                                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                    Đang tải dữ liệu thí sinh...
                                </td>
                            </tr>
                        ) : ListUsers && ListUsers.length > 0 ? (
                            ListUsers.map((item, index) => {
                                const roleName = (item.role || 'USER').toUpperCase();
                                const isAdmin = roleName === 'ADMIN';

                                return (
                                    <tr key={`table-user-${item.id || index}`}>
                                        <td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                                            #{item.id}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {renderAvatar(item)}
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark">{item.username || '--'}</div>
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.92rem' }}>
                                            {item.email || '--'}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${isAdmin ? 'bg-primary' : 'bg-success'}`}
                                                style={{ fontSize: '0.78rem', padding: '5px 10px', borderRadius: '12px' }}
                                            >
                                                {roleName}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                                    onClick={() => handleViewBtnUpdate(item)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye size={13} />
                                                    <span className="d-none d-md-inline">Xem</span>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                                                    onClick={() => handleClinkBtnUpdate(item)}
                                                    title="Chỉnh sửa thông tin"
                                                >
                                                    <FaEdit size={13} />
                                                    <span className="d-none d-md-inline">Sửa</span>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                    onClick={() => handleDeleteBtnUpdate(item)}
                                                    title="Xóa người dùng"
                                                >
                                                    <FaTrashAlt size={13} />
                                                    <span className="d-none d-md-inline">Xóa</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted">
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                                    <div>Không tìm thấy người dùng nào phù hợp.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center justify-content-md-end p-3 border-top">
                    <ReactPaginate
                        pageCount={totalPages}
                        onPageChange={handlePageClick}
                        breakLabel="..."
                        nextLabel="Sau >"
                        pageRangeDisplayed={3}
                        marginPagesDisplayed={2}
                        previousLabel="< Trước"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        disabledClassName="disabled"
                        breakClassName="page-item"
                        breakLinkClassName="page-link"
                        containerClassName="pagination pagination-sm mb-0"
                        activeClassName="active"
                        forcePage={Number.isInteger(currentPage) && currentPage > 0 ? currentPage - 1 : 0}
                    />
                </div>
            )}
        </div>
    );
};

export default TableUserPagination;