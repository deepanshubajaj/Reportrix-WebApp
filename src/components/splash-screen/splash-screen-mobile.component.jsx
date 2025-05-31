import React, { useState } from 'react';
import './splash-screen-mobile.style.scss';

function SplashScreenMobile({ onComplete }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isWaitingForPlay, setIsWaitingForPlay] = useState(true);
    const [showGif, setShowGif] = useState(false);

    const handleStart = async () => {
        if (!isWaitingForPlay) return;

        try {
            const audio = new Audio('/news_splash_screen_asset/news_audio.mp3');
            await audio.play();

            setIsWaitingForPlay(false);
            setShowGif(true);

            setTimeout(() => {
                audio.pause();
                setIsVisible(false);
                if (onComplete) onComplete();
            }, 4000);
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`splash-screen-mobile ${isWaitingForPlay ? 'waiting' : 'playing'}`}
            onClick={handleStart}
            onTouchStart={handleStart}
        >
            {isWaitingForPlay ? (
                <>
                    <div className="start-message">Tap anywhere to start</div>
                    <audio src="/news_splash_screen_asset/news_audio.mp3" preload="auto" />
                </>
            ) : (
                <img
                    src="/news_splash_screen_asset/phone-news-video.gif"
                    alt="Breaking News"
                    className="splash-gif"
                />
            )}
        </div>
    );
}

export default SplashScreenMobile;
