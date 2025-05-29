import React, { useEffect, useState, useRef } from 'react';
import './splash-screen.style.scss';

function SplashScreen({ onComplete }) {
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const playAttemptRef = useRef(false);

  const ensureAudioPlaying = () => {
    if (audioRef.current && audioRef.current.paused && !isVideoEnded && playAttemptRef.current) {
      console.log('Attempting to resume paused audio...');
      audioRef.current.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
  };

  const handleUserInteraction = () => {
    setHasInteracted(true);
    console.log('User interaction detected');

    // Start video and audio playback explicitly on user gesture
    if (audioRef.current) {
      console.log('Audio element exists, attempting to play...');
      console.log('Audio initial state:', {
        muted: audioRef.current.muted,
        volume: audioRef.current.volume,
        paused: audioRef.current.paused,
        currentTime: audioRef.current.currentTime,
        readyState: audioRef.current.readyState
      });

      audioRef.current.muted = false;
      audioRef.current.volume = 1;
      playAttemptRef.current = true;

      audioRef.current
        .play()
        .then(() => {
          console.log('Audio playback started successfully');
          console.log('Audio state after play:', {
            muted: audioRef.current.muted,
            volume: audioRef.current.volume,
            paused: audioRef.current.paused,
            currentTime: audioRef.current.currentTime
          });
        })
        .catch((error) => {
          console.error('Audio playback error:', error);
          console.log('Audio state when error occurred:', {
            muted: audioRef.current.muted,
            volume: audioRef.current.volume,
            paused: audioRef.current.paused,
            currentTime: audioRef.current.currentTime
          });
        });
    } else {
      console.error('Audio element not found');
    }

    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video playback error:', error);
      });
    }

    // Start forced end timer
    startTimer();
  };

  const startTimer = () => {
    setTimeout(() => {
      setIsVideoEnded(true);
      playAttemptRef.current = false;
      if (audioRef.current) {
        console.log('Timer ended, stopping audio');
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 4000);
  };

  useEffect(() => {
    if (isVideoEnded) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVideoEnded, onComplete]);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    playAttemptRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Add event listeners for audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => console.log('Audio can play');
      const handlePlaying = () => console.log('Audio is playing');
      const handlePause = () => {
        console.log('Audio paused');
        ensureAudioPlaying();
      };
      const handleError = (e) => console.error('Audio error:', e);

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  if (!hasInteracted) {
    return (
      <div
        className="splash-screen"
        onClick={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <div className="start-prompt">
          <h2>Tap or click anywhere to start</h2>
        </div>
        {/* preload audio early in DOM */}
        <audio
          ref={audioRef}
          src="/news_splash_screen_asset/news_audio.mp3"
          preload="auto"
          loop
        />
      </div>
    );
  }

  return (
    <div className={`splash-screen ${isVideoEnded ? 'fade-out' : ''}`}>
      <audio
        ref={audioRef}
        src="/news_splash_screen_asset/news_audio.mp3"
        preload="auto"
        loop
      />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnd}
        className="splash-video"
      >
        <source src="/news_splash_screen_asset/breaking_news.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default SplashScreen;
