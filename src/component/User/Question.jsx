import React, { useState } from "react";
import _ from "lodash";
import Lightbox from "react-awesome-lightbox";
import "./Question.scss";

const Question = (props) => {
    const { data, index, handleCheckBox } = props;
    const [isPreviewImage, setIsPreviewImage] = useState(false);

    if (_.isEmpty(data)) return null;

    const answers = data.answers || [];

    const handleSelectAnswer = (answerId) => {
        handleCheckBox(answerId, data.questionId);
    };

    return (
        <div className="question-component">
            {/* Question Header */}
            <div className="question-header">
                <span className="question-number-badge">
                    Câu {index + 1}
                </span>
                <h3 className="question-title-text">
                    {data.questionDescription}
                </h3>
            </div>

            {/* Question Image if present */}
            {data.image && (
                <div
                    className="question-image-box"
                    onClick={() => setIsPreviewImage(true)}
                    title="Nhấn để phóng to ảnh"
                >
                    <img
                        src={`data:image/jpeg;base64,${data.image}`}
                        alt={`Minh họa câu ${index + 1}`}
                        className="q-img"
                    />
                    <span className="zoom-hint">🔍 Phóng to</span>
                </div>
            )}

            {/* Interactive Option Cards */}
            <div className="options-list">
                {answers.map((a, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = !!a.isSelected;

                    return (
                        <div
                            key={a.id || idx}
                            className={`option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectAnswer(a.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSelectAnswer(a.id);
                                }
                            }}
                        >
                            <span className="option-letter">{letter}</span>
                            <span className="option-text">{a.description}</span>
                            <span className="check-indicator">
                                {isSelected ? '✓' : ''}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Image Zoom Lightbox */}
            {isPreviewImage && data.image && (
                <Lightbox
                    image={`data:image/jpeg;base64,${data.image}`}
                    title={`Ảnh minh họa câu hỏi ${index + 1}`}
                    onClose={() => setIsPreviewImage(false)}
                />
            )}
        </div>
    );
};

export default Question;
