/**
 * mockData.js — Dữ liệu mẫu khởi tạo cho QuizMaster Standalone Mode
 * Khi không có backend, toàn bộ dữ liệu được quản lý trong localStorage
 */

const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@gmail.com',
    password: 'admin123',
    username: 'Admin QuizMaster',
    role: 'ADMIN',
    image: '',
  },
  {
    id: 2,
    email: 'user@gmail.com',
    password: 'user123',
    username: 'Nguyễn Văn Thí Sinh',
    role: 'USER',
    image: '',
  },
  {
    id: 3,
    email: 'toan@gmail.com',
    password: 'toan123',
    username: 'Toàn Nguyễn',
    role: 'USER',
    image: '',
  },
];

const MOCK_QUIZZES = [
  {
    id: 1,
    name: 'JavaScript ES6+ & Asynchronous',
    description: 'Kiểm tra kiến thức JavaScript hiện đại: Arrow Functions, Destructuring, Promises, Async/Await và Event Loop.',
    difficulty: 'MEDIUM',
    image: '',
    questionCount: 5,
    duration: 10,
  },
  {
    id: 2,
    name: 'React.js & Redux Toolkit',
    description: 'Đánh giá năng lực React: Hooks, Component Lifecycle, Redux Toolkit, Context API và Performance Optimization.',
    difficulty: 'HARD',
    image: '',
    questionCount: 5,
    duration: 15,
  },
  {
    id: 3,
    name: 'HTML5, CSS3 & Web Performance',
    description: 'Nền tảng Web cơ bản: Semantic HTML, Flexbox, Grid, CSS Variables, Core Web Vitals và Accessibility.',
    difficulty: 'EASY',
    image: '',
    questionCount: 5,
    duration: 8,
  },
];

// Cấu trúc câu hỏi theo format của backend gốc
// Mỗi question có nhiều answers, mỗi answer có isCorrect
const MOCK_QUESTIONS = {
  // Quiz 1: JavaScript ES6+ & Asynchronous (MEDIUM)
  1: [
    {
      id: 101,
      quizId: 1,
      description: "Trong JavaScript ES6, 'Closure' được định nghĩa chính xác là gì?",
      image: null,
      answers: [
        { id: 1001, description: 'Một hàm có quyền truy cập vào phạm vi biến (scope) của hàm cha bao bọc nó, ngay cả khi hàm cha đã kết thúc thực thi', isCorrect: true },
        { id: 1002, description: 'Một phương thức dùng để giải phóng bộ nhớ RAM khỏi các biến không còn tham chiếu', isCorrect: false },
        { id: 1003, description: 'Cú pháp khai báo biến hằng số trong phiên bản ES6 (const)', isCorrect: false },
        { id: 1004, description: 'Một công cụ đóng gói mã nguồn (bundler) tương tự Webpack hoặc Rollup', isCorrect: false },
      ],
    },
    {
      id: 102,
      quizId: 1,
      description: "Sự khác biệt chính giữa 'let' và 'var' trong JavaScript là gì?",
      image: null,
      answers: [
        { id: 1005, description: "'let' có phạm vi Block Scope, còn 'var' có phạm vi Function Scope", isCorrect: true },
        { id: 1006, description: "'let' chỉ dùng được trong vòng lặp for, 'var' dùng được ở mọi nơi", isCorrect: false },
        { id: 1007, description: "'let' không thể gán lại giá trị sau khi khai báo", isCorrect: false },
        { id: 1008, description: "'var' là từ khóa mới trong ES6 thay thế hoàn toàn cho 'let'", isCorrect: false },
      ],
    },
    {
      id: 103,
      quizId: 1,
      description: "Promise trong JavaScript có bao nhiêu trạng thái (states)?",
      image: null,
      answers: [
        { id: 1009, description: '2 trạng thái: Resolved và Rejected', isCorrect: false },
        { id: 1010, description: '3 trạng thái: Pending, Fulfilled (Resolved), và Rejected', isCorrect: true },
        { id: 1011, description: '4 trạng thái: Pending, Loading, Success, và Error', isCorrect: false },
        { id: 1012, description: '1 trạng thái duy nhất: Async', isCorrect: false },
      ],
    },
    {
      id: 104,
      quizId: 1,
      description: "Toán tử Spread (...) trong ES6 có công dụng chính là gì?",
      image: null,
      answers: [
        { id: 1013, description: 'Sao chép nông (shallow copy) hoặc giải nén các phần tử của mảng / object', isCorrect: true },
        { id: 1014, description: 'So sánh tuyệt đối bằng giá trị và kiểu dữ liệu (===)', isCorrect: false },
        { id: 1015, description: 'Bắt buộc ép kiểu dữ liệu chuỗi sang số nguyên', isCorrect: false },
        { id: 1016, description: 'Xóa vĩnh viễn một thuộc tính ra khỏi bộ nhớ', isCorrect: false },
      ],
    },
    {
      id: 105,
      quizId: 1,
      description: "Kết quả của đoạn code sau là gì?\nconsole.log(typeof null)",
      image: null,
      answers: [
        { id: 1017, description: '"null"', isCorrect: false },
        { id: 1018, description: '"undefined"', isCorrect: false },
        { id: 1019, description: '"object"', isCorrect: true },
        { id: 1020, description: '"boolean"', isCorrect: false },
      ],
    },
  ],

  // Quiz 2: React.js & Redux Toolkit (HARD)
  2: [
    {
      id: 201,
      quizId: 2,
      description: "Trong React, hook nào được sử dụng để thực hiện Side Effects (gọi API, thiết lập Timer)?",
      image: null,
      answers: [
        { id: 2001, description: 'useState()', isCorrect: false },
        { id: 2002, description: 'useEffect()', isCorrect: true },
        { id: 2003, description: 'useMemo()', isCorrect: false },
        { id: 2004, description: 'useRef()', isCorrect: false },
      ],
    },
    {
      id: 202,
      quizId: 2,
      description: "Ưu điểm vượt trội nhất của Redux Toolkit so với Redux truyền thống là gì?",
      image: null,
      answers: [
        { id: 2005, description: 'Tích hợp sẵn createSlice, Immer.js (viết mutate an toàn) và cấu hình store cực kỳ ngắn gọn', isCorrect: true },
        { id: 2006, description: 'Chỉ hoạt động được trên môi trường máy chủ Node.js', isCorrect: false },
        { id: 2007, description: 'Loại bỏ hoàn toàn khái niệm action và reducer', isCorrect: false },
        { id: 2008, description: 'Không cho phép sử dụng middleware bất đồng bộ', isCorrect: false },
      ],
    },
    {
      id: 203,
      quizId: 2,
      description: "React.memo() được sử dụng với mục đích gì?",
      image: null,
      answers: [
        { id: 2009, description: 'Lưu trữ dữ liệu vào localStorage của trình duyệt', isCorrect: false },
        { id: 2010, description: 'Tránh re-render component khi props không thay đổi (memoization)', isCorrect: true },
        { id: 2011, description: 'Tạo ghi chú (memo) trong mã nguồn để developer đọc', isCorrect: false },
        { id: 2012, description: 'Thay thế hoàn toàn useCallback() và useMemo()', isCorrect: false },
      ],
    },
    {
      id: 204,
      quizId: 2,
      description: "Trong React, sự khác nhau giữa Controlled Component và Uncontrolled Component là gì?",
      image: null,
      answers: [
        { id: 2013, description: 'Controlled Component quản lý giá trị qua React state, Uncontrolled Component quản lý giá trị qua DOM ref', isCorrect: true },
        { id: 2014, description: 'Controlled Component chỉ dùng cho class component, Uncontrolled dùng cho function component', isCorrect: false },
        { id: 2015, description: 'Không có sự khác biệt, chỉ là cách đặt tên khác nhau', isCorrect: false },
        { id: 2016, description: 'Controlled Component là component có CSS, Uncontrolled là component không có CSS', isCorrect: false },
      ],
    },
    {
      id: 205,
      quizId: 2,
      description: "Virtual DOM trong React hoạt động như thế nào?",
      image: null,
      answers: [
        { id: 2017, description: 'React tạo một bản sao nhẹ của DOM thật trong bộ nhớ, so sánh sự khác biệt (diffing) rồi chỉ cập nhật phần thay đổi lên DOM thật', isCorrect: true },
        { id: 2018, description: 'React thay thế toàn bộ DOM thật mỗi khi state thay đổi', isCorrect: false },
        { id: 2019, description: 'Virtual DOM là một trình duyệt ảo chạy bên trong Node.js', isCorrect: false },
        { id: 2020, description: 'Virtual DOM chỉ hoạt động trên mobile, không hoạt động trên desktop', isCorrect: false },
      ],
    },
  ],

  // Quiz 3: HTML5, CSS3 & Web Performance (EASY)
  3: [
    {
      id: 301,
      quizId: 3,
      description: "Thẻ HTML5 nào được sử dụng để đánh dấu phần nội dung chính (main content) của trang web?",
      image: null,
      answers: [
        { id: 3001, description: '<main>', isCorrect: true },
        { id: 3002, description: '<div id="main">', isCorrect: false },
        { id: 3003, description: '<content>', isCorrect: false },
        { id: 3004, description: '<body>', isCorrect: false },
      ],
    },
    {
      id: 302,
      quizId: 3,
      description: "Thuộc tính CSS 'display: flex' tạo ra loại layout nào?",
      image: null,
      answers: [
        { id: 3005, description: 'Layout hai chiều (2D) với hàng và cột', isCorrect: false },
        { id: 3006, description: 'Layout một chiều (1D) theo hàng hoặc cột', isCorrect: true },
        { id: 3007, description: 'Layout cố định không responsive', isCorrect: false },
        { id: 3008, description: 'Layout chỉ dành cho hình ảnh', isCorrect: false },
      ],
    },
    {
      id: 303,
      quizId: 3,
      description: "Core Web Vitals bao gồm những chỉ số nào?",
      image: null,
      answers: [
        { id: 3009, description: 'LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), CLS (Cumulative Layout Shift)', isCorrect: true },
        { id: 3010, description: 'HTML, CSS, JavaScript', isCorrect: false },
        { id: 3011, description: 'RAM, CPU, GPU', isCorrect: false },
        { id: 3012, description: 'Width, Height, Depth', isCorrect: false },
      ],
    },
    {
      id: 304,
      quizId: 3,
      description: "CSS Variable (Custom Property) được khai báo như thế nào?",
      image: null,
      answers: [
        { id: 3013, description: '$color: red; (giống Sass)', isCorrect: false },
        { id: 3014, description: '--color: red; và sử dụng bằng var(--color)', isCorrect: true },
        { id: 3015, description: '@color = red;', isCorrect: false },
        { id: 3016, description: 'let color = "red"; trong thẻ <style>', isCorrect: false },
      ],
    },
    {
      id: 305,
      quizId: 3,
      description: "Thuộc tính 'alt' trong thẻ <img> có vai trò gì?",
      image: null,
      answers: [
        { id: 3017, description: 'Thay đổi kích thước ảnh', isCorrect: false },
        { id: 3018, description: 'Cung cấp văn bản thay thế khi ảnh không tải được và hỗ trợ trình đọc màn hình (Accessibility)', isCorrect: true },
        { id: 3019, description: 'Thêm hiệu ứng animation cho ảnh', isCorrect: false },
        { id: 3020, description: 'Tạo hyperlink từ ảnh đến trang khác', isCorrect: false },
      ],
    },
  ],
};

const MOCK_SUBMISSIONS = [];

export { MOCK_USERS, MOCK_QUIZZES, MOCK_QUESTIONS, MOCK_SUBMISSIONS };
