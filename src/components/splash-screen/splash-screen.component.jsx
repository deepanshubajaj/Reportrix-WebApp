import React, { useEffect, useState, useRef } from 'react';
import './splash-screen.style.scss';

function SplashScreen({ onComplete }) {
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [assetLoadError, setAssetLoadError] = useState(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const playAttemptRef = useRef(false);

  useEffect(() => {
    // Check if assets are accessible
    const checkAssets = async () => {
      try {
        const videoResponse = await fetch('/NewsSplashScreenAsset/BreakingNews.mp4');
        const audioResponse = await fetch('/NewsSplashScreenAsset/NewsAudio.mp3');

        if (!videoResponse.ok || !audioResponse.ok) {
          console.error('Asset loading failed:', {
            video: videoResponse.status,
            audio: audioResponse.status
          });
          setAssetLoadError('Failed to load media assets');
        }
      } catch (error) {
        console.error('Asset check error:', error);
        setAssetLoadError(error.message);
      }
    };

    checkAssets();
  }, []);

  const ensureAudioPlaying = () => {
    if (audioRef.current && audioRef.current.paused && !isVideoEnded && playAttemptRef.current) {
      console.log('Attempting to resume paused audio...');
      audioRef.current.play().catch(error => {
        console.error('Error resuming audio:', error);
        setAssetLoadError('Audio playback error: ' + error.message);
      });
    }
  };

  const handleUserInteraction = () => {
    setHasInteracted(true);
    console.log('User interaction detected');

    if (assetLoadError) {
      console.log('Skipping media playback due to asset load error');
      onComplete();
      return;
    }

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
        })
        .catch((error) => {
          console.error('Audio playback error:', error);
          setAssetLoadError('Audio playback error: ' + error.message);
        });
    }

    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video playback error:', error);
        setAssetLoadError('Video playback error: ' + error.message);
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
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }, 4000);
  };

  useEffect(() => {
    if (isVideoEnded || assetLoadError) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVideoEnded, assetLoadError, onComplete]);

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
      const handleError = (e) => {
        console.error('Audio error:', e);
        setAssetLoadError('Audio error: ' + (e.message || 'Unknown error'));
      };

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
          {assetLoadError && <p className="error-message">Error: {assetLoadError}</p>}
        </div>
        {/* preload audio early in DOM */}
        <audio
          ref={audioRef}
          src="/NewsSplashScreenAsset/NewsAudio.mp3"
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
        src="/NewsSplashScreenAsset/NewsAudio.mp3"
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
        onError={(e) => {
          console.error('Video error:', e);
          setAssetLoadError('Video error: ' + (e.target.error?.message || 'Unknown error'));
        }}
      >
        <source src="/NewsSplashScreenAsset/BreakingNews.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {assetLoadError && (
        <div className="error-overlay">
          <p className="error-message">{assetLoadError}</p>
        </div>
      )}
    </div>
  );
}

export default SplashScreen;
