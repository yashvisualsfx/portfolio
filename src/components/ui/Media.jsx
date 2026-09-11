import { useEffect, useRef, useState } from 'react';
import './media.css';

/**
 * A still that may become a reel.
 *
 * The image always paints first — no layout ever waits on video. The reel's
 * `src` is attached imperatively the first time the frame is genuinely
 * active, so the bytes are never requested for a project the visitor has not
 * reached. On a metered connection the still is the whole story.
 */
export function Media({
  cover,
  reel,
  active = false,
  eager = false,
  sizes = '100vw',
  className = '',
  children,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !reel) return undefined;

    if (!active) {
      video.pause();
      return undefined;
    }

    // Respect an explicit data-saving preference before spending megabytes.
    if (navigator.connection?.saveData) return undefined;

    if (!video.getAttribute('src')) video.setAttribute('src', reel.src);
    video.play().catch(() => {});

    return () => video.pause();
  }, [active, reel]);

  return (
    <div className={`media${className ? ` ${className}` : ''}`} data-playing={playing && active}>
      <div className="media__frame">
        <img
          className="media__img"
          src={cover.src}
          srcSet={cover.small ? `${cover.small} 1024w, ${cover.src} 1920w` : undefined}
          sizes={sizes}
          alt={cover.alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
        />

        {reel && (
          <video
            ref={videoRef}
            className="media__reel"
            poster={reel.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
          />
        )}
      </div>
      <span className="media__scrim" aria-hidden="true" />
      {children}
    </div>
  );
}
