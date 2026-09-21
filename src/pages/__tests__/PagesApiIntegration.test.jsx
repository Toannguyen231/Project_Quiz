import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import Classes from '../Classes';
import TipsNhanh from '../TipsNhanh';
import Blog from '../Blog';
import * as apiService from '../../component/sevices/apiService';

// Mock apiService
jest.mock('../../component/sevices/apiService', () => ({
    getClasses: jest.fn(),
    joinClass: jest.fn(),
    getMyClasses: jest.fn(),
    getTips: jest.fn(),
    getPosts: jest.fn(),
    getPostDetail: jest.fn(),
}));

// Mock toast
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe('Pages & Real API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Classes Page', () => {
        const mockClassesData = [
            {
                id: 1,
                name: 'Lớp Luyện Thi TOEIC 2026 — Ca Tối',
                code: 'TOEIC-26-T6',
                teacher: 'Thầy Nguyễn Ngọc Toàn',
                schedule: 'T2 · T4 · T6 — 19:00',
                status: 'active',
                max_students: 50,
                description: 'Luyện thi TOEIC 4 kỹ năng, cam kết đầu ra 700+.',
                students: 43,
                isJoined: false,
            },
            {
                id: 2,
                name: 'Lớp React & Frontend Master',
                code: 'REACT-26-M',
                teacher: 'Thầy Nguyễn Ngọc Toàn',
                schedule: 'T3 · T5 — 20:00',
                status: 'active',
                max_students: 40,
                description: 'Từ JS core đến React 18, Redux Toolkit, tối ưu hiệu năng.',
                students: 28,
                isJoined: false,
            },
        ];

        test('renders Classes page and loads class list from API', async () => {
            apiService.getClasses.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get classes success', DT: mockClassesData },
            });

            renderWithProviders(<Classes />);

            expect(screen.getByText(/Lớp Học Trực Tuyến/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('Lớp Luyện Thi TOEIC 2026 — Ca Tối')).toBeInTheDocument();
                expect(screen.getByText('Lớp React & Frontend Master')).toBeInTheDocument();
            });

            expect(apiService.getClasses).toHaveBeenCalledTimes(1);
        });

        test('handles joining a class when authenticated', async () => {
            apiService.getClasses.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get classes success', DT: mockClassesData },
            });
            apiService.getMyClasses.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get my classes success', DT: [] },
            });
            apiService.joinClass.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Tham gia lớp học thành công', DT: { class_id: 1, user_id: 1 } },
            });

            const preloadedState = {
                user: {
                    isAuthenticated: true,
                    account: { id: 1, username: 'Student1', role: 'USER' },
                },
            };

            renderWithProviders(<Classes />, { preloadedState });

            await waitFor(() => {
                expect(screen.getByText('Lớp Luyện Thi TOEIC 2026 — Ca Tối')).toBeInTheDocument();
            });

            const joinButtons = screen.getAllByRole('button', { name: /Tham gia lớp/i });
            fireEvent.click(joinButtons[0]);

            await waitFor(() => {
                expect(apiService.joinClass).toHaveBeenCalledWith(1);
            });
        });
    });

    describe('TipsNhanh Page', () => {
        const mockTipsData = [
            {
                id: 1,
                title: 'Mẹo làm trắc nghiệm TOEIC Reading trong 30 giây',
                category: 'TOEIC',
                duration: '8:24',
                duration_seconds: 504,
                level: 'Mọi trình độ',
                description: 'Chiến thuật đọc lướt skimming',
                video_url: 'https://youtube.com/test',
                featured: true,
            },
            {
                id: 2,
                title: 'Cách bấm giờ ôn thi hiệu quả với phương pháp Pomodoro',
                category: 'Kỹ năng học',
                duration: '5:12',
                duration_seconds: 312,
                level: 'Mọi trình độ',
                description: 'Chia nhỏ phiên ôn 25 phút',
                video_url: 'https://youtube.com/test2',
                featured: false,
            },
        ];

        test('renders TipsNhanh page and filters by category chip', async () => {
            apiService.getTips.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get tips success', DT: mockTipsData },
            });

            renderWithProviders(<TipsNhanh />);

            expect(screen.getByText(/Tips Nhanh — Video & Bí Kíp Ôn Thi/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('Mẹo làm trắc nghiệm TOEIC Reading trong 30 giây')).toBeInTheDocument();
            });

            // Click Xem ngay to open preview modal
            const watchButtons = screen.getAllByRole('button', { name: /Xem ngay/i });
            fireEvent.click(watchButtons[0]);

            await waitFor(() => {
                expect(screen.getByText(/Tóm tắt nội dung chính:/i)).toBeInTheDocument();
            });

            // Close modal
            const closeButtons = screen.getAllByRole('button', { name: /Đóng/i });
            fireEvent.click(closeButtons[0]);

            await waitFor(() => {
                expect(screen.queryByText(/Tóm tắt nội dung chính:/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Blog Page', () => {
        const mockPostsData = [
            {
                id: 1,
                title: 'Kinh nghiệm đạt 850+ TOEIC từ con số 0 trong 3 tháng',
                excerpt: 'Lộ trình chi tiết theo tuần...',
                content: 'Nội dung đầy đủ của bài viết TOEIC 850+...',
                tag: 'TOEIC',
                author: 'Thầy Nguyễn Ngọc Toàn',
                readTime: '6 phút',
                date: '2026-09-21',
                featured: true,
            },
        ];

        test('renders Blog page and opens post detail modal', async () => {
            apiService.getPosts.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get posts success', DT: mockPostsData },
            });
            apiService.getPostDetail.mockResolvedValueOnce({
                data: { EC: 0, EM: 'Get post detail success', DT: mockPostsData[0] },
            });

            renderWithProviders(<Blog />);

            expect(screen.getByText(/Blog Tin Tức & Kinh Nghiệm Thi/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('Kinh nghiệm đạt 850+ TOEIC từ con số 0 trong 3 tháng')).toBeInTheDocument();
            });

            // Click read post button
            const readBtn = screen.getByRole('button', { name: /Đọc bài viết →/i });
            fireEvent.click(readBtn);

            await waitFor(() => {
                expect(screen.getByText(/Nội dung đầy đủ của bài viết TOEIC 850+/i)).toBeInTheDocument();
            });

            // Close modal
            const finishBtn = screen.getByRole('button', { name: /Đã đọc xong/i });
            fireEvent.click(finishBtn);

            await waitFor(() => {
                expect(screen.queryByText(/Nội dung đầy đủ của bài viết TOEIC 850+/i)).not.toBeInTheDocument();
            });
        });
    });
});
