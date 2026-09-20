import React from 'react';
import './Skeleton.scss';

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) {
    return (
        <div
            className={`qm-skeleton-loader ${className}`}
            style={{
                width,
                height,
                borderRadius,
                ...style,
            }}
            aria-hidden="true"
        />
    );
}

export function QuizCardSkeleton() {
    return (
        <div className="card qm-quiz-card-skeleton p-3 mb-4 shadow-sm border-0">
            <Skeleton width="100%" height="160px" borderRadius="12px" className="mb-3" />
            <Skeleton width="70%" height="24px" className="mb-2" />
            <Skeleton width="90%" height="16px" className="mb-3" />
            <div className="d-flex justify-content-between align-items-center">
                <Skeleton width="30%" height="20px" />
                <Skeleton width="40%" height="36px" borderRadius="20px" />
            </div>
        </div>
    );
}
