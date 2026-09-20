import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableQuiz from '../TableQuiz';

describe('TableQuiz Component Unit Tests', () => {
    const mockQuizzes = [
        {
            id: 1,
            name: 'React Fundamentals',
            description: 'Basic React and JSX concepts',
            difficulty: 'EASY',
            image: 'data:image/png;base64,mockimagedata',
        },
        {
            id: 2,
            name: 'Advanced JavaScript & Async',
            description: 'Promises, Event Loop, Closures',
            difficulty: 'HARD',
            image: null, // No image, uses difficulty color
        },
        {
            id: 3,
            name: 'Redux State Management',
            description: 'Actions, reducers, thunk middleware',
            difficulty: 'MEDIUM',
            image: 'https://example.com/redux.jpg',
        },
        {
            id: 4,
            name: 'Special Assessment',
            description: '',
            difficulty: 'EXPERT', // Custom difficulty
            image: null,
        },
    ];

    const mockHandlers = {
        handleShowViewQuiz: jest.fn(),
        handleShowUpdateQuiz: jest.fn(),
        hanldeShowDeleteQuiz: jest.fn(),
        handleShowAssignQuiz: jest.fn(),
        handleDuplicateQuiz: jest.fn(),
        handleExportQuiz: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders empty state when listQuiz is empty or undefined', () => {
        const { rerender } = render(<TableQuiz listQuiz={[]} {...mockHandlers} />);
        expect(screen.getByText(/Chưa có bài thi nào trong hệ thống/i)).toBeInTheDocument();

        rerender(<TableQuiz listQuiz={null} {...mockHandlers} />);
        expect(screen.getByText(/Chưa có bài thi nào trong hệ thống/i)).toBeInTheDocument();
    });

    test('renders table headers and rows for each quiz item', () => {
        render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

        // Headers
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Ảnh bìa')).toBeInTheDocument();
        expect(screen.getByText('Tên bài thi')).toBeInTheDocument();
        expect(screen.getByText('Mô tả')).toBeInTheDocument();
        expect(screen.getByText('Độ khó')).toBeInTheDocument();
        expect(screen.getByText('Hành động')).toBeInTheDocument();

        // Row IDs and Names
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.getByText('Basic React and JSX concepts')).toBeInTheDocument();

        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('Advanced JavaScript & Async')).toBeInTheDocument();

        expect(screen.getByText('#3')).toBeInTheDocument();
        expect(screen.getByText('Redux State Management')).toBeInTheDocument();
    });

    test('renders difficulty badges accurately for EASY, MEDIUM, HARD, and custom types', () => {
        render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

        expect(screen.getByText('Dễ')).toHaveClass('badge', 'bg-success');
        expect(screen.getByText('Khó')).toHaveClass('badge', 'bg-danger');
        expect(screen.getByText('Trung bình')).toHaveClass('badge', 'bg-warning');
        expect(screen.getByText('EXPERT')).toHaveClass('badge', 'bg-secondary');
    });

    test('renders image thumbnails or difficulty fallback icons correctly', () => {
        render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

        // Quizzes with image render <img>
        const img1 = screen.getByAltText('React Fundamentals');
        expect(img1).toBeInTheDocument();
        expect(img1.src).toContain('data:image/png;base64,mockimagedata');

        const img3 = screen.getByAltText('Redux State Management');
        expect(img3).toBeInTheDocument();
        expect(img3.src).toBe('https://example.com/redux.jpg');

        // Quizzes without image render fallback 📝
        const fallbackIcons = screen.getAllByText('📝');
        expect(fallbackIcons.length).toBe(2); // Quiz 2 and Quiz 4
    });

    describe('Action Button Event Handlers', () => {
        test('triggers handleShowViewQuiz when view button is clicked', () => {
            render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

            const viewButtons = screen.getAllByTitle('Xem chi tiết đề thi');
            fireEvent.click(viewButtons[0]);

            expect(mockHandlers.handleShowViewQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
        });

        test('triggers handleShowUpdateQuiz when edit button is clicked', () => {
            render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

            const editButtons = screen.getAllByTitle('Chỉnh sửa đề thi');
            fireEvent.click(editButtons[1]);

            expect(mockHandlers.handleShowUpdateQuiz).toHaveBeenCalledWith(mockQuizzes[1]);
        });

        test('triggers handleShowAssignQuiz when assign button is clicked', () => {
            render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

            const assignButtons = screen.getAllByTitle('Gán đề thi cho thí sinh');
            fireEvent.click(assignButtons[0]);

            expect(mockHandlers.handleShowAssignQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
        });

        test('triggers handleDuplicateQuiz and disables button when duplicatingId matches', () => {
            const { rerender } = render(
                <TableQuiz listQuiz={mockQuizzes} {...mockHandlers} duplicatingId={null} />
            );

            const duplicateButtons = screen.getAllByTitle('Nhân bản đề thi (Duplicate)');
            fireEvent.click(duplicateButtons[0]);
            expect(mockHandlers.handleDuplicateQuiz).toHaveBeenCalledWith(mockQuizzes[0]);

            // Re-render with quiz 1 currently duplicating
            rerender(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} duplicatingId={1} />);
            const updatedButtons = screen.getAllByTitle('Nhân bản đề thi (Duplicate)');
            expect(updatedButtons[0]).toBeDisabled();
            expect(updatedButtons[1]).not.toBeDisabled();
        });

        test('triggers handleExportQuiz when export button is clicked', () => {
            render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

            const exportButtons = screen.getAllByTitle('Xuất đề thi ra JSON (Export)');
            fireEvent.click(exportButtons[2]);

            expect(mockHandlers.handleExportQuiz).toHaveBeenCalledWith(mockQuizzes[2]);
        });

        test('triggers hanldeShowDeleteQuiz when delete button is clicked', () => {
            render(<TableQuiz listQuiz={mockQuizzes} {...mockHandlers} />);

            const deleteButtons = screen.getAllByTitle('Xóa đề thi');
            fireEvent.click(deleteButtons[0]);

            expect(mockHandlers.hanldeShowDeleteQuiz).toHaveBeenCalledWith(mockQuizzes[0]);
        });

        test('renders safely when optional action handlers are omitted', () => {
            render(
                <TableQuiz
                    listQuiz={mockQuizzes.slice(0, 1)}
                    handleShowViewQuiz={mockHandlers.handleShowViewQuiz}
                    handleShowUpdateQuiz={mockHandlers.handleShowUpdateQuiz}
                    hanldeShowDeleteQuiz={mockHandlers.hanldeShowDeleteQuiz}
                />
            );

            // Optional buttons (Assign, Duplicate, Export) should not be rendered
            expect(screen.queryByTitle('Gán đề thi cho thí sinh')).not.toBeInTheDocument();
            expect(screen.queryByTitle('Nhân bản đề thi (Duplicate)')).not.toBeInTheDocument();
            expect(screen.queryByTitle('Xuất đề thi ra JSON (Export)')).not.toBeInTheDocument();

            // Mandatory buttons remain
            expect(screen.getByTitle('Xem chi tiết đề thi')).toBeInTheDocument();
            expect(screen.getByTitle('Chỉnh sửa đề thi')).toBeInTheDocument();
            expect(screen.getByTitle('Xóa đề thi')).toBeInTheDocument();
        });
    });
});
