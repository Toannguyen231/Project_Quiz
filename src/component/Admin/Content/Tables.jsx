import React from 'react';

const Tables = (props) => {
    const { ListUsers = [], handleClinkBtnUpdate, handleViewBtnUpdate, handleDeleteBtnUpdate } = props;

    return (
        <div className="table-responsive">
            <table className="table table-hover table-bordered mb-0 align-middle">
                <thead className="table-light">
                    <tr>
                        <th scope="col" style={{ width: '70px', textAlign: 'center' }}>ID</th>
                        <th scope="col">Tên người dùng</th>
                        <th scope="col">Email</th>
                        <th scope="col" style={{ width: '120px' }}>Vai trò</th>
                        <th scope="col" style={{ width: '220px', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {ListUsers && ListUsers.length > 0 ? (
                        ListUsers.map((item, index) => {
                            return (
                                <tr key={`table-user-${item.id || index}`}>
                                    <td style={{ textAlign: 'center', fontWeight: '600' }}>#{item.id}</td>
                                    <td>{item.username}</td>
                                    <td>{item.email}</td>
                                    <td>
                                        <span className={`badge ${item.role === 'ADMIN' ? 'bg-primary' : 'bg-success'}`}>
                                            {item.role || 'USER'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn btn-sm btn-secondary me-2" onClick={() => handleViewBtnUpdate(item)}>Xem</button>
                                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleClinkBtnUpdate(item)}>Sửa</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBtnUpdate(item)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }} className="text-muted">
                                Không có dữ liệu
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Tables;