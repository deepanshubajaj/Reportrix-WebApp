import React from 'react';
import './profile-image-modal.style.scss';
import CloseIcon from '@mui/icons-material/Close';

function ProfileImageModal({ imageUrl, onClose }) {
    return (
        <div className="profile-image-modal-overlay" onClick={onClose}>
            <div className="profile-image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    <CloseIcon />
                </button>
                <img src={imageUrl} alt="Profile" />
            </div>
        </div>
    );
}

export default ProfileImageModal; 