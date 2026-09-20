import '../Quiz/ManageQuiz.scss'
import Select from 'react-select';
import { useState, useEffect, useRef } from 'react';
import TableQuiz from './TableQuiz';
import Accordion from 'react-bootstrap/Accordion';
import { getAllQuizForAdmin, postCreateQuiz } from '../../../sevices/apiService';
import ModalUpdateQuiz from './ModalUpdateQuiz';
import ModalViewQuiz from './ModalViewQuiz';
import ModalDelete from './ModalDelete';
import { toast } from 'react-toastify';
const ManageQuiz = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('EASY');
    const [image, setImage] = useState(null);
    const [dataModal, setDataModal] = useState({});
    const [listQuiz, setListQuiz] = useState([]);
    const [showModalViewQuiz, setShowModalViewQuiz] = useState(false);
    const [showModalUpdateQuiz, setShowModalUpdateQuiz] = useState(false);
    const [showModalDeleteQuiz, setShowModalDeleteQuiz] = useState(false);
    const [dataDelete, setDataDelete] = useState({});
    const fileInputRef = useRef(null);
    const options = [
        { value: 'EASY', label: 'EASY' },
        { value: 'MEDIUM', label: 'MEDIUM' },
        { value: 'HARD', label: 'HARD' },
    ];
    const hanleChangeFile = (event) => {
        if (event.target && event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    }

    useEffect(() => {
        fetchListQuiz();
    }, []);

    const fetchListQuiz = async () => {
        try {
            let res = await getAllQuizForAdmin();
            if (res && res.data && res.data.EC === 0) {
                setListQuiz(res.data.DT);
            }
        } catch (error) {
            console.warn('Lỗi tải danh sách quiz:', error);
        }
    }

    const handleSubmitQuiz = async () => {
        if (!name) {
            toast.warning('Vui lòng nhập tên bài thi');
            return;
        }
        try {
            let res = await postCreateQuiz(name, description, type, image);
            if (res && res.data && res.data.EC === 0) {
                toast.success(res.data.EM || 'Tạo bài thi thành công!');
                setName('');
                setDescription('');
                setType('EASY');
                setImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                fetchListQuiz();
            } else {
                toast.error(res?.data?.EM || 'Tạo bài thi thất bại');
            }
        } catch (error) {
            toast.error('Lỗi tạo bài thi');
        }
    }

    const handleShowViewQuiz = (quiz) => {
        setShowModalViewQuiz(true);
        setDataModal(quiz);
    }

    const handleShowUpdateQuiz = (quiz) => {
        console.log("CLICK UPDATE quiz =", quiz);
        setShowModalUpdateQuiz(true);
        setDataModal(quiz);
    }

    const hanldeShowDeleteQuiz = (quiz) => {
        setShowModalDeleteQuiz(true);
        setDataDelete(quiz);
    }

    const resetDataModal = () => {
        setDataModal({});
    }

    return (
        <div className="q-container">
            <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Manage Quiz</Accordion.Header>
                    <Accordion.Body>
                        <div className="add-new">
                            <fieldset className="border rounded-3 p-3">
                                <legend className="float-none w-auto px-3">Add new quiz</legend>
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Your quiz name"
                                        value={name}
                                        onChange={(event) => { setName(event.target.value) }}
                                        id="quizName"
                                    />
                                    <label htmlFor="quizName">Name</label>
                                </div>
                                <div className="form-floating">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Description"
                                        value={description}
                                        onChange={(event) => { setDescription(event.target.value) }}
                                        id="quizDescription"
                                    />
                                    <label htmlFor="quizDescription">Description</label>
                                </div>
                                <div className="more-actions">
                                    <div className="my-3">
                                        <Select
                                            value={options.find(option => option.value === type)}
                                            onChange={(selectedOption) => setType(selectedOption.value)}
                                            options={options}
                                            placeholder="Quiz type..."
                                        />
                                    </div>
                                    <label className="mb-1">Upload Image</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={(event) => { hanleChangeFile(event) }}
                                        ref={fileInputRef}
                                    />
                                    <div className="quiz-save">
                                        <button
                                            onClick={() => handleSubmitQuiz()}
                                            className="btn btn-warning mb-1 mt-3">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <div className='list-details'>
                <TableQuiz
                    listQuiz={listQuiz}
                    setListQuiz={setListQuiz}
                    handleShowViewQuiz={handleShowViewQuiz}
                    handleShowUpdateQuiz={handleShowUpdateQuiz}
                    hanldeShowDeleteQuiz={hanldeShowDeleteQuiz}
                />
                <div>
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
                </div>
            </div>


        </div>
    );
}

export default ManageQuiz;