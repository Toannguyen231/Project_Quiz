import React from 'react';
import { FaEye, FaEdit, FaTrashAlt, FaCopy, FaFileExport, FaUserPlus } from 'react-icons/fa';

const TableQuiz = (props) => {
    const {
        listQuiz = [],
        handleShowViewQuiz,
        handleShowUpdateQuiz,
        hanldeShowDeleteQuiz,
        handleShowAssignQuiz,
        handleDuplicateQuiz,
        handleExportQuiz,
        duplicatingId = null
    } = props;

    const renderThumbnail = (item) => {
        if (item.image) {
            const src = item.image.startsWith('data:') || item.image.startsWith('http')
                ? item.image
                : `data:image/jpeg;base64,${item.image}`;
            return (
                <img
                    src={src}
                    alt={item.name || 'Đề thi'}
                    style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0'
                    }}
                />
            );
        }

        const colors = {
            EASY: '#10b981',
            MEDIUM: '#f59e0b',
            HARD: '#ef4444',
        };
        const diff = (item.difficulty || 'EASY').toUpperCase();
        const bg = colors[diff] || '#6366f1';

        return (
            <div
                style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    backgroundColor: bg,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}
            >
                📝
            </div>
        );
    };

    const getDifficultyBadge = (difficulty) => {
        const diff = (difficulty || 'EASY').toUpperCase();
        switch (diff) {
            case 'EASY':
                return <span className="badge bg-success" style={{ borderRadius: '12px', padding: '5px 10px' }}>Dễ</span>;
            case 'MEDIUM':
                return <span className="badge bg-warning text-dark" style={{ borderRadius: '12px', padding: '5px 10px' }}>Trung bình</span>;
            case 'HARD':
                return <span className="badge bg-danger" style={{ borderRadius: '12px', padding: '5px 10px' }}>Khó</span>;
            default:
                return <span className="badge bg-secondary" style={{ borderRadius: '12px', padding: '5px 10px' }}>{diff}</span>;
        }
    };

    return (
        <div className="table-responsive mt-3" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }}>
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr style={{ color: '#475569', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th scope="col" style={{ width: '60px', textAlign: 'center' }}>ID</th>
                        <th scope="col" style={{ width: '70px', textAlign: 'center' }}>Ảnh bìa</th>
                        <th scope="col">Tên bài thi</th>
                        <th scope="col">Mô tả</th>
                        <th scope="col" style={{ width: '120px', textAlign: 'center' }}>Độ khó</th>
                        <th scope="col" style={{ width: '330px', textAlign: 'center' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {listQuiz && listQuiz.length > 0 ? (
                        listQuiz.map((item, index) => {
                            const isCloning = duplicatingId === item.id;
                            return (
                                <tr key={`table-quiz-${item.id || index}`}>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                        #{item.id}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {renderThumbnail(item)}
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{item.name || '--'}</div>
                                    </td>
                                    <td className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '280px' }}>
                                        <div className="text-truncate" title={item.description}>
                                            {item.description || '--'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {getDifficultyBadge(item.difficulty)}
                                    </td>
                                    <td>
                                        <div className="d-flex justify-content-center align-items-center gap-1 flex-wrap">
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleShowViewQuiz(item)}
                                                title="Xem chi tiết đề thi"
                                            >
                                                <FaEye size={13} />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() => handleShowUpdateQuiz(item)}
                                                title="Chỉnh sửa đề thi"
                                            >
                                                <FaEdit size={13} />
                                            </button>
                                            {handleShowAssignQuiz && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleShowAssignQuiz(item)}
                                                    title="Gán đề thi cho thí sinh"
                                                >
                                                    <FaUserPlus size={13} />
                                                </button>
                                            )}
                                            {handleDuplicateQuiz && (
                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() => handleDuplicateQuiz(item)}
                                                    disabled={isCloning}
                                                    title="Nhân bản đề thi (Duplicate)"
                                                >
                                                    <FaCopy size={13} className={isCloning ? 'fa-spin' : ''} />
                                                </button>
                                            )}
                                            {handleExportQuiz && (
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => handleExportQuiz(item)}
                                                    title="Xuất đề thi ra JSON (Export)"
                                                >
                                                    <FaFileExport size={13} />
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => hanldeShowDeleteQuiz(item)}
                                                title="Xóa đề thi"
                                            >
                                                <FaTrashAlt size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-5 text-muted">
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
                                <div>Chưa có bài thi nào trong hệ thống. Hãy thêm mới hoặc nhập từ file JSON!</div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableQuiz;