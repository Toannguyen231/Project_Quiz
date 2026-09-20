import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../Quiz/ManageQuiz.scss';
import Select from 'react-select';
import TableQuiz from './TableQuiz';
import Accordion from 'react-bootstrap/Accordion';
import {
    getAllQuizForAdmin,
    postCreateQuiz,
    getQuestionsByQuizId,
    postSaveQuestionsForQuiz
} from '../../../sevices/apiService';
import instance from '../../../util/axiosCutomes';
import ModalUpdateQuiz from './ModalUpdateQuiz';
import ModalViewQuiz from './ModalViewQuiz';
import ModalDelete from './ModalDelete';
import ModalAssignQuiz from './ModalAssignQuiz';
import ModalImportQuiz from './ModalImportQuiz';
import { toast } from 'react-toastify';
import { FaFileImport, FaSyncAlt, FaPlusCircle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const ManageQuiz = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('EASY');
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [listQuiz, setListQuiz] = useState([]);
    const [loading, setLoading] = useState(false);
    const [duplicatingId, setDuplicatingId] = useState(null);

    // Modal visibility and data states
    const [dataModal, setDataModal] = useState({});
    const [showModalViewQuiz, setShowModalViewQuiz] = useState(false);
    const [showModalUpdateQuiz, setShowModalUpdateQuiz] = useState(false);
    const [showModalDeleteQuiz, setShowModalDeleteQuiz] = useState(false);
    const [showModalAssignQuiz, setShowModalAssignQuiz] = useState(false);
    const [showModalImportQuiz, setShowModalImportQuiz] = useState(false);
    const [selectedQuizForAssign, setSelectedQuizForAssign] = useState(null);
    const [dataDelete, setDataDelete] = useState({});

    const fileInputRef = useRef(null);

    const options = [
        { value: 'EASY', label: 'Dễ (Easy)' },
        { value: 'MEDIUM', label: 'Trung bình (Medium)' },
        { value: 'HARD', label: 'Khó (Hard)' },
    ];

    const handleChangeFile = (event) => {
        if (event.target && event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (!file.type.startsWith('image/')) {
                toast.error('Tệp tải lên phải là hình ảnh (PNG, JPG, WEBP)!');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Dung lượng ảnh bìa vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!');
                return;
            }
            setImage(file);
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setImage(null);
            setPreviewImage('');
        }
    };

    const fetchListQuiz = useCallback(async () => {
        try {
            setLoading(true);
            let res = await getAllQuizForAdmin();
            if (res && res.data && res.data.EC === 0) {
                setListQuiz(res.data.DT || []);
            }
        } catch (error) {
            console.warn('Lỗi tải danh sách quiz:', error);
            toast.error('Không thể tải danh sách đề thi');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchListQuiz();
    }, [fetchListQuiz]);

    const handleSubmitQuiz = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.warning('Vui lòng nhập tên bài thi!');
            return;
        }

        try {
            setIsCreating(true);
            let res = await postCreateQuiz(trimmedName, description.trim(), type, image);
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Tạo bài thi mới thành công!');
                setName('');
                setDescription('');
                setType('EASY');
                setImage(null);
                setPreviewImage('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                await fetchListQuiz();
            } else {
                toast.error(res?.data?.EM || 'Tạo bài thi thất bại');
            }
        } catch (error) {
            console.error('Lỗi tạo bài thi:', error);
            toast.error('Đã xảy ra lỗi khi tạo bài thi');
        } finally {
            setIsCreating(false);
        }
    };

    // Duplicate Quiz (with client fallback)
    const handleDuplicateQuiz = async (quiz) => {
        if (!quiz || !quiz.id) return;
        const confirmClone = window.confirm(`Bạn có muốn nhân bản đề thi "${quiz.name}" kèm toàn bộ câu hỏi không?`);
        if (!confirmClone) return;

        try {
            setDuplicatingId(quiz.id);
            let duplicatedViaApi = false;

            // Attempt backend duplicate endpoint
            try {
                const res = await instance.post(`/api/v1/quiz/${quiz.id}/duplicate`);
                if (res && res.data && res.data.EC === 0) {
                    duplicatedViaApi = true;
                    toast.success(res.data.EM || `Đã nhân bản "${quiz.name}" thành công!`);
                }
            } catch (err) {
                console.warn('Backend duplicate endpoint fallback:', err);
            }

            // Client-side fallback if backend endpoint not yet deployed
            if (!duplicatedViaApi) {
                // 1. Fetch questions of current quiz
                let existingQuestions = [];
                try {
                    const qRes = await getQuestionsByQuizId(quiz.id);
                    if (qRes && qRes.data && qRes.data.EC === 0) {
                        existingQuestions = qRes.data.DT || [];
                    }
                } catch (qErr) {
                    console.warn('Lỗi lấy câu hỏi khi nhân bản:', qErr);
                }

                // 2. Create cloned quiz
                const cloneName = `${quiz.name} (Bản sao)`;
                const createRes = await postCreateQuiz(
                    cloneName,
                    quiz.description || '',
                    (quiz.difficulty || 'EASY').toUpperCase(),
                    null
                );

                if (!createRes || !createRes.data || createRes.data.EC !== 0) {
                    throw new Error(createRes?.data?.EM || 'Không thể tạo bản sao đề thi');
                }

                const newQuizId = createRes.data.DT?.id;

                // 3. Clone questions to the new quiz
                if (newQuizId && existingQuestions.length > 0) {
                    const formattedQuestions = existingQuestions.map((q) => ({
                        id: uuidv4(),
                        description: q.description || '',
                        imageFile: '',
                        imageName: '',
                        type: q.type || 'SINGLE',
                        answer: (q.answers || q.answer || []).map((ans) => ({
                            id: uuidv4(),
                            description: ans.description || '',
                            iscorrect: !!(ans.isCorrect || ans.iscorrect),
                        })),
                    }));

                    await postSaveQuestionsForQuiz(newQuizId, formattedQuestions);
                }

                toast.success(`Đã nhân bản thành công: "${cloneName}"!`);
            }

            await fetchListQuiz();
        } catch (error) {
            console.error('Lỗi khi nhân bản đề thi:', error);
            toast.error(error.message || 'Nhân bản bài thi thất bại');
        } finally {
            setDuplicatingId(null);
        }
    };

    // Export Quiz to JSON
    const handleExportQuiz = async (quiz) => {
        if (!quiz || !quiz.id) return;
        try {
            toast.info(`Đang chuẩn bị xuất dữ liệu bài thi #${quiz.id}...`);

            // Fetch questions for this quiz
            let questionsList = [];
            try {
                const res = await getQuestionsByQuizId(quiz.id);
                if (res && res.data && res.data.EC === 0) {
                    questionsList = res.data.DT || [];
                }
            } catch (err) {
                console.warn('Lấy câu hỏi xuất JSON:', err);
            }

            // Structure export JSON
            const exportPayload = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                quiz: {
                    id: quiz.id,
                    name: quiz.name,
                    description: quiz.description,
                    difficulty: quiz.difficulty,
                },
                questions: questionsList.map((q) => ({
                    id: q.id,
                    description: q.description,
                    type: q.type || 'SINGLE',
                    answers: (q.answers || q.answer || []).map((ans) => ({
                        id: ans.id,
                        description: ans.description,
                        isCorrect: !!(ans.isCorrect || ans.iscorrect),
                    })),
                })),
            };

            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
            const downloadAnchor = document.createElement('a');
            const sanitizedName = (quiz.name || `quiz_${quiz.id}`).replace(/[^a-zA-Z0-9_-]/g, '_');
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `${sanitizedName}_export.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            toast.success(`Đã xuất đề thi "${quiz.name}" ra file JSON thành công!`);
        } catch (error) {
            console.error('Lỗi khi xuất đề thi JSON:', error);
            toast.error('Xuất đề thi ra JSON thất bại');
        }
    };

    const handleShowViewQuiz = (quiz) => {
        setShowModalViewQuiz(true);
        setDataModal(quiz);
    };

    const handleShowUpdateQuiz = (quiz) => {
        setShowModalUpdateQuiz(true);
        setDataModal(quiz);
    };

    const hanldeShowDeleteQuiz = (quiz) => {
        setShowModalDeleteQuiz(true);
        setDataDelete(quiz);
    };

    const handleShowAssignQuiz = (quiz) => {
        setSelectedQuizForAssign(quiz);
        setShowModalAssignQuiz(true);
    };

    const resetDataModal = () => {
        setDataModal({});
    };

    return (
        <div className="q-container p-3 p-md-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header with Title and Action buttons */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-2 border-bottom">
                <div>
                    <h3 style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                        📝 Quản Lý Bộ Đề Thi (Quizzes)
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: 0 }}>
                        Tạo, chỉnh sửa, gán cho thí sinh, nhân bản và xuất/nhập bộ đề thi dạng JSON.
                    </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm"
                        style={{ borderRadius: '8px', padding: '9px 16px', fontWeight: '500' }}
                        onClick={() => setShowModalImportQuiz(true)}
                        title="Tải lên tệp JSON để tạo đề thi và câu hỏi"
                    >
                        <FaFileImport />
                        <span>Nhập đề từ JSON</span>
                    </button>
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-1 shadow-sm"
                        style={{ borderRadius: '8px', padding: '9px 14px' }}
                        onClick={fetchListQuiz}
                        disabled={loading}
                        title="Tải lại danh sách bài thi"
                    >
                        <FaSyncAlt className={loading ? 'fa-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Accordion: Create New Quiz */}
            <Accordion defaultActiveKey="0" flush className="shadow-sm mb-4" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <div className="d-flex align-items-center gap-2 fw-bold text-primary">
                            <FaPlusCircle />
                            <span>Tạo Mới Bộ Đề Thi (Add New Quiz)</span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div className="add-new">
                            <fieldset className="border rounded-3 p-3">
                                <legend className="float-none w-auto px-3 fs-6 fw-bold text-secondary">
                                    Thông tin bài thi
                                </legend>
                                <div className="row g-3">
                                    <div className="col-12 col-md-8">
                                        <div className="form-floating mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tên bài thi..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                id="quizName"
                                            />
                                            <label htmlFor="quizName">Tên bài thi (Ví dụ: Kiểm tra React Nâng Cao) *</label>
                                        </div>
                                        <div className="form-floating mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Mô tả tóm tắt..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                id="quizDescription"
                                            />
                                            <label htmlFor="quizDescription">Mô tả bài thi</label>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                            Mức độ khó
                                        </label>
                                        <div className="mb-3">
                                            <Select
                                                value={options.find(option => option.value === type)}
                                                onChange={(selectedOption) => setType(selectedOption.value)}
                                                options={options}
                                                placeholder="Chọn độ khó..."
                                            />
                                        </div>

                                        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>
                                            Ảnh bìa bài thi (&lt; 2MB)
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleChangeFile}
                                            ref={fileInputRef}
                                        />
                                    </div>

                                    {previewImage && (
                                        <div className="col-12">
                                            <div className="p-2 border rounded bg-light text-center" style={{ maxHeight: '120px', overflow: 'hidden' }}>
                                                <img
                                                    src={previewImage}
                                                    alt="Xem trước ảnh bìa"
                                                    style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-12 d-flex justify-content-end">
                                        <button
                                            onClick={handleSubmitQuiz}
                                            className="btn btn-warning px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                                            disabled={isCreating}
                                        >
                                            <FaPlusCircle />
                                            <span>{isCreating ? 'Đang lưu...' : 'Lưu Đề Thi'}</span>
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Table of Quizzes wrapped in .table-responsive */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                <div className="card-header bg-transparent border-0 pt-3 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 className="fw-bold mb-0 text-dark">
                        📋 Danh Sách Bộ Đề Hiện Có ({listQuiz.length})
                    </h5>
                    <small className="text-muted">Nhấn biểu tượng thao tác để xem, sửa, gán thí sinh, nhân bản, xuất hoặc xóa</small>
                </div>
                <div className="card-body p-0">
                    <TableQuiz
                        listQuiz={listQuiz}
                        handleShowViewQuiz={handleShowViewQuiz}
                        handleShowUpdateQuiz={handleShowUpdateQuiz}
                        hanldeShowDeleteQuiz={hanldeShowDeleteQuiz}
                        handleShowAssignQuiz={handleShowAssignQuiz}
                        handleDuplicateQuiz={handleDuplicateQuiz}
                        handleExportQuiz={handleExportQuiz}
                        duplicatingId={duplicatingId}
                    />
                </div>
            </div>

            {/* Modals Container */}
            <ModalViewQuiz
                show={showModalViewQuiz}
                setShow={setShowModalViewQuiz}
                dataModal={dataModal}
                resetViewDataModal={resetDataModal}
            />

            <ModalUpdateQuiz
                show={showModalUpdateQuiz}
                setShow={setShowModalUpdateQuiz}
                dataModal={dataModal}
                resetUpdateDataModal={resetDataModal}
                fetchListQuiz={fetchListQuiz}
            />

            <ModalDelete
                show={showModalDeleteQuiz}
                setShow={setShowModalDeleteQuiz}
                dataModal={dataModal}
                resetDeleteDataModal={resetDataModal}
                fetchListQuiz={fetchListQuiz}
                dataDelete={dataDelete}
                setDataDelete={setDataDelete}
            />

            <ModalAssignQuiz
                show={showModalAssignQuiz}
                setShow={setShowModalAssignQuiz}
                quiz={selectedQuizForAssign}
            />

            <ModalImportQuiz
                show={showModalImportQuiz}
                setShow={setShowModalImportQuiz}
                fetchListQuiz={fetchListQuiz}
            />
        </div>
    );
};

export default ManageQuiz;