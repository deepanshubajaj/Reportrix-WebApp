import React from 'react';
import './image-modal.style.scss';
import CloseIcon from '@mui/icons-material/Close';

function ImageModal({ imageUrl, onClose }) {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="image-modal-backdrop" onClick={handleBackdropClick}>
            <div className="image-modal-content">
                <button className="close-button" onClick={onClose}>
                    <CloseIcon />
                </button>
                <img src={imageUrl} alt="Full size" />
            </div>
        </div>
    );
}

export default ImageModal; 