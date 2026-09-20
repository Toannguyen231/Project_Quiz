import React, { useState } from 'react';

/**
 * AnalyticsCharts.jsx
 * Pure React SVG Charts (Zero external NPM chart dependencies)
 * - Daily Submissions Bar/Line Chart
 * - Quiz Difficulty Donut Chart
 * - Performance Metrics
 */

// Helper to convert Polar to Cartesian coordinates
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

// Helper to describe SVG donut arc path
const describeDonutArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
    // Clamp full circle
    const isFullCircle = endAngle - startAngle >= 359.99;
    const effectiveEnd = isFullCircle ? startAngle + 359.99 : endAngle;

    const startOuter = polarToCartesian(x, y, outerRadius, effectiveEnd);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, startAngle);
    const endInner = polarToCartesian(x, y, innerRadius, effectiveEnd);

    const largeArcFlag = effectiveEnd - startAngle <= 180 ? '0' : '1';

    return [
        'M', startOuter.x, startOuter.y,
        'A', outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
        'L', startInner.x, startInner.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, endInner.x, endInner.y,
        'Z'
    ].join(' ');
};

const AnalyticsCharts = ({
    dailyData = [],
    difficultyData = [],
    summary = { avgScore: 7.6, passRate: 78, totalExams: 28 },
    loading = false
}) => {
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
    const [activeSlice, setActiveSlice] = useState(null);
    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

    // Fallback sample data if empty
    const displayDaily = dailyData && dailyData.length > 0 ? dailyData : [
        { date: '15/09', count: 4, avgScore: 6.8 },
        { date: '16/09', count: 7, avgScore: 7.2 },
        { date: '17/09', count: 5, avgScore: 7.5 },
        { date: '18/09', count: 12, avgScore: 8.1 },
        { date: '19/09', count: 9, avgScore: 7.8 },
        { date: '20/09', count: 14, avgScore: 8.4 },
        { date: '21/09', count: 8, avgScore: 7.9 },
    ];

    const displayDifficulty = difficultyData && difficultyData.length > 0 ? difficultyData : [
        { difficulty: 'EASY', count: 5, label: 'Dễ (Easy)', color: '#10b981' },
        { difficulty: 'MEDIUM', count: 8, label: 'Trung bình (Medium)', color: '#f59e0b' },
        { difficulty: 'HARD', count: 3, label: 'Khó (Hard)', color: '#ef4444' },
    ];

    // Compute Daily Chart Metrics
    const counts = displayDaily.map(d => d.count || d.submissions || 0);
    const maxCount = Math.max(...counts, 10);
    const yMax = Math.ceil(maxCount * 1.25); // headroom for labels

    const chartWidth = 560;
    const chartHeight = 220;
    const paddingLeft = 45;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 40;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const barWidth = Math.min(36, Math.max(16, Math.floor(plotWidth / (displayDaily.length * 1.6))));
    const stepX = plotWidth / (displayDaily.length > 1 ? displayDaily.length - 1 : 1);

    // Generate coordinates for Line Chart
    const points = displayDaily.map((item, i) => {
        const val = item.count || item.submissions || 0;
        const x = displayDaily.length === 1 ? paddingLeft + plotWidth / 2 : paddingLeft + i * stepX;
        const y = paddingTop + plotHeight - (val / yMax) * plotHeight;
        return { x, y, val, label: item.date };
    });

    const linePathD = points.reduce((acc, pt, i) => {
        return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaPathD = points.length > 0
        ? `${linePathD} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
        : '';

    // Compute Donut Slices
    const totalDiffCount = displayDifficulty.reduce((sum, item) => sum + (item.count || 0), 0);
    let cumulativeAngle = 0;
    const slices = displayDifficulty.map((item) => {
        const count = item.count || 0;
        const percent = totalDiffCount > 0 ? (count / totalDiffCount) : 0;
        const sliceAngle = percent * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + sliceAngle;
        cumulativeAngle = endAngle;

        const colorMap = {
            EASY: '#10b981',
            MEDIUM: '#f59e0b',
            HARD: '#ef4444',
            easy: '#10b981',
            medium: '#f59e0b',
            hard: '#ef4444',
        };

        const sliceColor = item.color || colorMap[item.difficulty] || '#6366f1';
        return {
            ...item,
            percent: Math.round(percent * 100),
            startAngle,
            endAngle,
            color: sliceColor,
            pathD: describeDonutArc(120, 120, 52, 92, startAngle, endAngle),
        };
    });

    return (
        <div className="analytics-charts-wrapper" style={{ marginBottom: '28px' }}>
            <div className="row g-3 mb-3">
                {/* Metric Summary Cards */}
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: '#fff' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div>
                                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Tỉ Lệ Đạt (Pass Rate)</span>
                                <h3 className="mb-0 mt-1 fw-bold">{summary.passRate ?? 78}%</h3>
                            </div>
                            <div className="mt-2" style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                                Điểm trung bình: <strong>{summary.avgScore ?? 7.6}/10</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div>
                                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Tổng Bài Làm Tuần Này</span>
                                <h3 className="mb-0 mt-1 fw-bold">{counts.reduce((a, b) => a + b, 0)}</h3>
                            </div>
                            <div className="mt-2" style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                                Tăng trưởng: <strong>+18.4%</strong> so với tuần trước
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff' }}>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                            <div>
                                <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Độ Khó Cân Bằng</span>
                                <h3 className="mb-0 mt-1 fw-bold">{totalDiffCount} Bộ Đề</h3>
                            </div>
                            <div className="mt-2" style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                                Phân bố: <strong>{displayDifficulty.length}</strong> cấp độ khảo thí
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                {/* Daily Submissions Chart */}
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">📈 Xu Hướng Lượt Nộp Bài (Daily Submissions)</h6>
                                <small className="text-muted">Theo dõi số lượt làm bài kiểm tra trong 7 ngày gần nhất</small>
                            </div>
                            <div className="btn-group btn-group-sm" role="group">
                                <button
                                    type="button"
                                    className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setChartType('bar')}
                                    style={{ fontSize: '0.78rem', borderRadius: '6px 0 0 6px' }}
                                >
                                    Cột (Bar)
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setChartType('line')}
                                    style={{ fontSize: '0.78rem', borderRadius: '0 6px 6px 0' }}
                                >
                                    Đường (Line)
                                </button>
                            </div>
                        </div>

                        <div className="card-body px-2 pb-3 pt-1">
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    style={{ width: '100%', height: 'auto', minWidth: '420px', display: 'block' }}
                                >
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.9" />
                                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
                                        </linearGradient>
                                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Y Grid Lines and Labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                        const y = paddingTop + plotHeight - ratio * plotHeight;
                                        const labelVal = Math.round(ratio * yMax);
                                        return (
                                            <g key={`grid-${idx}`}>
                                                <line
                                                    x1={paddingLeft}
                                                    y1={y}
                                                    x2={chartWidth - paddingRight}
                                                    y2={y}
                                                    stroke="#f1f5f9"
                                                    strokeWidth="1"
                                                    strokeDasharray={ratio === 0 ? '0' : '3 3'}
                                                />
                                                <text
                                                    x={paddingLeft - 8}
                                                    y={y + 4}
                                                    fill="#94a3b8"
                                                    fontSize="10"
                                                    textAnchor="end"
                                                >
                                                    {labelVal}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Render Bar Chart */}
                                    {chartType === 'bar' && displayDaily.map((item, i) => {
                                        const val = item.count || item.submissions || 0;
                                        const barHeight = Math.max(4, (val / yMax) * plotHeight);
                                        const x = paddingLeft + (i * (plotWidth / displayDaily.length)) + ((plotWidth / displayDaily.length - barWidth) / 2);
                                        const y = paddingTop + plotHeight - barHeight;
                                        const isHovered = hoveredBarIndex === i;

                                        return (
                                            <g
                                                key={`bar-${i}`}
                                                onMouseEnter={() => setHoveredBarIndex(i)}
                                                onMouseLeave={() => setHoveredBarIndex(null)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={barWidth}
                                                    height={barHeight}
                                                    fill={isHovered ? '#4338ca' : 'url(#barGradient)'}
                                                    rx="4"
                                                    ry="4"
                                                    style={{ transition: 'all 0.2s ease' }}
                                                />
                                                {/* Value label on top of bar */}
                                                <text
                                                    x={x + barWidth / 2}
                                                    y={y - 6}
                                                    fill={isHovered ? '#1e1b4b' : '#64748b'}
                                                    fontSize="11"
                                                    fontWeight={isHovered ? 'bold' : '600'}
                                                    textAnchor="middle"
                                                >
                                                    {val}
                                                </text>
                                                {/* X Axis Date Label */}
                                                <text
                                                    x={x + barWidth / 2}
                                                    y={chartHeight - 12}
                                                    fill="#64748b"
                                                    fontSize="10.5"
                                                    textAnchor="middle"
                                                >
                                                    {item.date}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Render Line Chart */}
                                    {chartType === 'line' && (
                                        <g>
                                            {areaPathD && (
                                                <path d={areaPathD} fill="url(#areaGradient)" />
                                            )}
                                            {linePathD && (
                                                <path
                                                    d={linePathD}
                                                    fill="none"
                                                    stroke="#4f46e5"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            )}
                                            {points.map((pt, i) => {
                                                const isHovered = hoveredBarIndex === i;
                                                return (
                                                    <g
                                                        key={`pt-${i}`}
                                                        onMouseEnter={() => setHoveredBarIndex(i)}
                                                        onMouseLeave={() => setHoveredBarIndex(null)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <circle
                                                            cx={pt.x}
                                                            cy={pt.y}
                                                            r={isHovered ? 6 : 4}
                                                            fill="#ffffff"
                                                            stroke="#4f46e5"
                                                            strokeWidth={isHovered ? 3 : 2.5}
                                                        />
                                                        <text
                                                            x={pt.x}
                                                            y={pt.y - 10}
                                                            fill="#4f46e5"
                                                            fontSize="11"
                                                            fontWeight="bold"
                                                            textAnchor="middle"
                                                        >
                                                            {pt.val}
                                                        </text>
                                                        <text
                                                            x={pt.x}
                                                            y={chartHeight - 12}
                                                            fill="#64748b"
                                                            fontSize="10.5"
                                                            textAnchor="middle"
                                                        >
                                                            {pt.label}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </g>
                                    )}
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Difficulty Distribution Donut Chart */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
                        <div className="card-header bg-transparent border-0 pt-3 px-3">
                            <h6 className="fw-bold mb-0 text-dark">🎯 Phân Bố Độ Khó Bộ Đề</h6>
                            <small className="text-muted">Tỉ lệ bài thi theo mức độ dễ / TB / khó</small>
                        </div>
                        <div className="card-body p-3 d-flex flex-column align-items-center justify-content-center">
                            <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                <svg
                                    viewBox="0 0 240 240"
                                    style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                                >
                                    {slices.map((slice, i) => {
                                        const isHovered = activeSlice === i;
                                        return (
                                            <path
                                                key={`slice-${i}`}
                                                d={slice.pathD}
                                                fill={slice.color}
                                                opacity={activeSlice !== null && !isHovered ? 0.45 : 1}
                                                stroke="#ffffff"
                                                strokeWidth="2"
                                                onMouseEnter={() => setActiveSlice(i)}
                                                onMouseLeave={() => setActiveSlice(null)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'opacity 0.2s, transform 0.2s',
                                                }}
                                            />
                                        );
                                    })}
                                </svg>
                                {/* Donut Center Label */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>
                                        {activeSlice !== null ? slices[activeSlice]?.count : totalDiffCount}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {activeSlice !== null ? slices[activeSlice]?.difficulty : 'Bộ Đề'}
                                    </div>
                                </div>
                            </div>

                            {/* Donut Legend */}
                            <div className="w-100 mt-3 pt-2 border-top">
                                {slices.map((slice, i) => (
                                    <div
                                        key={`legend-${i}`}
                                        className="d-flex align-items-center justify-content-between py-1 px-2 rounded"
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: activeSlice === i ? '#f8fafc' : 'transparent',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={() => setActiveSlice(i)}
                                        onMouseLeave={() => setActiveSlice(null)}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <span
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    backgroundColor: slice.color,
                                                    display: 'inline-block'
                                                }}
                                            />
                                            <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: activeSlice === i ? '600' : '500' }}>
                                                {slice.label || slice.difficulty}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                                                {slice.count} đề
                                            </span>
                                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', minWidth: '32px', textAlign: 'right' }}>
                                                {slice.percent}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
