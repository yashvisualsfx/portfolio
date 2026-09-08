import { useEffect, useRef, useState } from "react";
import { getMedia } from "../../data/media.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import styles from "./MediaFrame.module.css";

/*
  Every piece of work on the site renders through here, so loading behaviour,
  blur-up and video playback are decided once.

  Video is the reason this exists. A page with ten autoplaying clips would
  fetch tens of megabytes nobody watches, so nothing is even given a `src`
  until it is near the viewport, and playback follows visibility: a clip out
  of frame is paused, not just invisible.
*/

/**
 * @param {object}  media     a `{ type, key }` reference from the project data
 * @param {string}  alt       required for stills; video posters use it too
 * @param {boolean} priority  skip lazy loading for something above the fold
 * @param {boolean} sound     offer a sound toggle (pieces cut to audio)
 * @param {number}  aspect    impose a frame shape instead of using the
 *                            asset's own — the art direction sometimes wants
 *                            a crop (a portrait column from a wider source),
 *                            and object-fit handles the rest
 * @param {string}  focus     object-position, to keep the subject in frame
 *                            when that crop is off-centre
 */
export function MediaFrame({
  media,
  alt = "",
  className = "",
  priority = false,
  sound = false,
  aspect: aspectOverride,
  focus,
  fallbackAspect = 16 / 9,
  children,
}) {
  const reduced = usePrefersReducedMotion();
  const resolved = getMedia(media);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [near, setNear] = useState(priority);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  // Whether the visitor has explicitly paused. Kept separate from `playing`
  // so scrolling a paused clip out of view and back does not quietly restart
  // it — an explicit pause outranks the visibility rule.
  const [userPaused, setUserPaused] = useState(false);

  const isVideo = resolved?.type === "video";

  // Two thresholds from one observer: a generous margin decides when to start
  // fetching, and actual intersection decides whether to play. The observer
  // only records state — playback is driven by the effect below, because on
  // the first intersection the element does not have a src yet (React has not
  // re-rendered with `near`), and a play() call there would reject and never
  // be retried.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !resolved) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) setNear(true);
        setVisible(entry.isIntersecting);
      },
      { rootMargin: "200px 0px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [resolved]);

  // <source> children are not picked up by an element that has already tried
  // to load, so the switch from "no sources" to "sources" needs an explicit
  // load() before anything will play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || !near) return;
    video.load();
  }, [isVideo, near]);

  // Playback follows visibility, and only once a source is actually attached.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || reduced || !near) return;

    if (visible && !userPaused) {
      // A play() that loses a race with unmount or a source swap rejects;
      // there is nothing useful to do about it.
      video.play().catch(() => {});
    } else if (!visible) {
      video.pause();
    }
  }, [visible, near, isVideo, reduced, userPaused]);

  // Pause everything while the tab is hidden — background playback burns
  // battery and decodes frames nobody is looking at.
  useEffect(() => {
    if (!isVideo) return undefined;
    const onVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    setMuted(next);
    video.muted = next;
    // Unmuting a clip the visitor wants to hear implies wanting it to run.
    if (!next && video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    }
  };

  const aspect = aspectOverride ?? resolved?.aspectRatio ?? fallbackAspect;

  const sources = [];
  if (resolved && isVideo) {
    sources.push({ src: resolved.src, type: "video/mp4", bytes: resolved.bytes ?? 0 });
    if (resolved.webm) {
      sources.push({ src: resolved.webm, type: "video/webm", bytes: resolved.webmBytes ?? 0 });
    }
    sources.sort((a, b) => (a.bytes || Infinity) - (b.bytes || Infinity));
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.frame} ${className}`}
      style={{
        aspectRatio: aspect,
        backgroundImage: resolved?.lqip ? `url(${resolved.lqip})` : undefined,
      }}
    >
      {!resolved && <span className={styles.pending}>Coming soon</span>}

      {resolved && !isVideo && (
        <img
          className={`${styles.media} ${loaded ? styles.loaded : ""}`}
          src={near ? resolved.src : undefined}
          alt={alt}
          width={resolved.width}
          height={resolved.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={focus ? { objectPosition: focus } : undefined}
          onLoad={() => setLoaded(true)}
        />
      )}

      {resolved && isVideo && (
        <video
          ref={videoRef}
          className={`${styles.media} ${loaded ? styles.loaded : ""}`}
          poster={resolved.poster}
          muted={muted}
          loop
          playsInline
          // Reduced motion gets the poster frame and a control, never a
          // clip that starts moving on its own.
          autoPlay={!reduced}
          preload="none"
          // Empty alt means decorative (a hover preview inside an aria-hidden
          // container); labelling it "" would announce an unnamed element.
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          onLoadedData={() => setLoaded(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          // Reduced motion hands over the browser's own controls rather than
          // autoplaying behind a custom bar.
          controls={reduced}
        >
          {/* A browser takes the first source it can decode, so the smaller
              file for this particular clip is offered first — which codec
              wins varies per piece. The other stays as fallback, which also
              covers builds with no H.264 decoder at all. Neither is attached
              until the frame is near the viewport. */}
          {near && sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      )}

      {resolved && isVideo && !reduced && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            onClick={togglePlay}
            aria-label={playing ? `Pause ${alt || "video"}` : `Play ${alt || "video"}`}
            title={playing ? "Pause" : "Play"}
          >
            <svg viewBox="0 0 12 12" aria-hidden="true">
              {playing ? (
                <path d="M2 1h3v10H2zM7 1h3v10H7z" />
              ) : (
                <path d="M2.5 1l8 5-8 5z" />
              )}
            </svg>
          </button>

          {sound && (
            <button
              type="button"
              className={styles.control}
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label="Sound"
              title={muted ? "Unmute" : "Mute"}
            >
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M1 4.5h2L6 2v8L3 7.5H1z" />
                {muted ? (
                  <path d="M7.8 4.2l2.6 2.6-.7.7-2.6-2.6zm2.6 0l.7.7-2.6 2.6-.7-.7z" />
                ) : (
                  <path d="M7.6 3.6a3.4 3.4 0 010 4.8l-.7-.7a2.4 2.4 0 000-3.4zm1.6-1.4a5.4 5.4 0 010 7.6l-.7-.7a4.4 4.4 0 000-6.2z" />
                )}
              </svg>
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
