import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalCreateUser from '../ModalCreateUser';
import { toast } from 'react-toastify';
import { postCreateUser } from '../../../sevices/apiService';

jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
    },
}));

jest.mock('../../../sevices/apiService', () => ({
    postCreateUser: jest.fn(),
}));

describe('ModalCreateUser Component Unit Tests', () => {
    const defaultProps = {
        show: true,
        setShow: jest.fn(),
        featchListUserWithPage: jest.fn(),
        currentPage: 1,
        setCurrentPage: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders all form inputs and modal controls when show is true', () => {
        render(<ModalCreateUser {...defaultProps} />);

        expect(screen.getByText(/Thêm Thí Sinh \/ Quản Trị Viên Mới/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Họ và tên \/ Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Vai trò hệ thống/i)).toBeInTheDocument();
        expect(screen.getByText('Hủy bỏ')).toBeInTheDocument();
        expect(screen.getByText('Lưu người dùng')).toBeInTheDocument();
    });

    describe('Client-side Form Validation', () => {
        test('rejects invalid email formats', async () => {
            render(<ModalCreateUser {...defaultProps} />);

            const emailInput = screen.getByLabelText(/Email/i);
            const passwordInput = screen.getByLabelText(/Mật khẩu/i);
            const usernameInput = screen.getByLabelText(/Họ và tên \/ Username/i);
            const submitBtn = screen.getByText('Lưu người dùng');

            // Fill invalid email
            fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
            fireEvent.change(passwordInput, { target: { value: 'password123' } });
            fireEvent.change(usernameInput, { target: { value: 'Valid User' } });

            fireEvent.click(submitBtn);

            expect(toast.error).toHaveBeenCalledWith('Email không hợp lệ. Vui lòng nhập đúng định dạng!');
            expect(postCreateUser).not.toHaveBeenCalled();
        });

        test('rejects password shorter than 6 characters', async () => {
            render(<ModalCreateUser {...defaultProps} />);

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@test.com' } });
            fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: '12345' } });
            fireEvent.change(screen.getByLabelText(/Họ và tên \/ Username/i), { target: { value: 'Valid User' } });

            fireEvent.click(screen.getByText('Lưu người dùng'));

            expect(toast.error).toHaveBeenCalledWith('Mật khẩu không được để trống và phải có ít nhất 6 ký tự!');
            expect(postCreateUser).not.toHaveBeenCalled();
        });

        test('rejects username shorter than 2 characters', async () => {
            render(<ModalCreateUser {...defaultProps} />);

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@test.com' } });
            fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: '123456' } });
            fireEvent.change(screen.getByLabelText(/Họ và tên \/ Username/i), { target: { value: 'A' } });

            fireEvent.click(screen.getByText('Lưu người dùng'));

            expect(toast.error).toHaveBeenCalledWith('Tên người dùng phải có ít nhất 2 ký tự!');
            expect(postCreateUser).not.toHaveBeenCalled();
        });

        test('rejects non-image avatar file upload', () => {
            render(<ModalCreateUser {...defaultProps} />);

            const fileInput = document.querySelector('#upload-user-photo');
            const pdfFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

            fireEvent.change(fileInput, { target: { files: [pdfFile] } });

            expect(toast.error).toHaveBeenCalledWith('Tệp tải lên phải là hình ảnh hợp lệ (PNG, JPG, WEBP, GIF)!');
        });

        test('rejects avatar file exceeding 2MB size limit', () => {
            render(<ModalCreateUser {...defaultProps} />);

            const fileInput = document.querySelector('#upload-user-photo');
            const largeFile = new File(['a'.repeat(2 * 1024 * 1024 + 10)], 'large-photo.jpg', {
                type: 'image/jpeg',
            });
            Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 });

            fireEvent.change(fileInput, { target: { files: [largeFile] } });

            expect(toast.error).toHaveBeenCalledWith('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!');
        });

        test('accepts valid image file and displays remove button', () => {
            render(<ModalCreateUser {...defaultProps} />);

            const fileInput = document.querySelector('#upload-user-photo');
            const validFile = new File(['image data'], 'avatar.png', { type: 'image/png' });
            Object.defineProperty(validFile, 'size', { value: 1024 * 500 }); // 500KB

            fireEvent.change(fileInput, { target: { files: [validFile] } });

            expect(screen.getByText('Xóa ảnh')).toBeInTheDocument();
            expect(screen.getByAltText('Xem trước ảnh đại diện')).toBeInTheDocument();

            // Click remove button
            fireEvent.click(screen.getByText('Xóa ảnh'));
            expect(screen.queryByText('Xóa ảnh')).not.toBeInTheDocument();
            expect(screen.getByText(/Chưa chọn ảnh xem trước/i)).toBeInTheDocument();
        });
    });

    describe('Submission & API Interaction', () => {
        test('submits valid data successfully and closes modal', async () => {
            postCreateUser.mockResolvedValueOnce({
                data: {
                    EC: 0,
                    EM: 'Tạo người dùng mới thành công!',
                },
            });

            render(<ModalCreateUser {...defaultProps} />);

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'newuser@quizmaster.edu' } });
            fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'securePass123' } });
            fireEvent.change(screen.getByLabelText(/Họ và tên \/ Username/i), { target: { value: 'Nguyễn Văn B' } });
            fireEvent.change(screen.getByLabelText(/Vai trò hệ thống/i), { target: { value: 'ADMIN' } });

            fireEvent.click(screen.getByText('Lưu người dùng'));

            await waitFor(() => {
                expect(postCreateUser).toHaveBeenCalledWith(
                    'newuser@quizmaster.edu',
                    'securePass123',
                    'Nguyễn Văn B',
                    'ADMIN',
                    null
                );
            });

            expect(toast.success).toHaveBeenCalledWith('Tạo người dùng mới thành công!');
            expect(defaultProps.setShow).toHaveBeenCalledWith(false);
            expect(defaultProps.featchListUserWithPage).toHaveBeenCalledWith(1);
        });

        test('handles API error response gracefully without closing modal', async () => {
            postCreateUser.mockResolvedValueOnce({
                data: {
                    EC: -1,
                    EM: 'Email đã tồn tại trong hệ thống',
                },
            });

            render(<ModalCreateUser {...defaultProps} />);

            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'duplicate@quiz.edu' } });
            fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: '123456' } });
            fireEvent.change(screen.getByLabelText(/Họ và tên \/ Username/i), { target: { value: 'User Duplicate' } });

            fireEvent.click(screen.getByText('Lưu người dùng'));

            await waitFor(() => {
                expect(postCreateUser).toHaveBeenCalled();
            });

            expect(toast.error).toHaveBeenCalledWith('Email đã tồn tại trong hệ thống');
            expect(defaultProps.setShow).not.toHaveBeenCalled();
        });

        test('clicking Hủy bỏ invokes setShow(false)', () => {
            render(<ModalCreateUser {...defaultProps} />);

            fireEvent.click(screen.getByText('Hủy bỏ'));
            expect(defaultProps.setShow).toHaveBeenCalledWith(false);
        });
    });
});
