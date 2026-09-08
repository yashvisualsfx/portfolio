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
 */
export function MediaFrame({
  media,
  alt = "",
  className = "",
  priority = false,
  sound = false,
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

    if (visible) {
      // A play() that loses a race with unmount or a source swap rejects;
      // there is nothing useful to do about it.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [visible, near, isVideo, reduced]);

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

  const aspect = resolved?.aspectRatio ?? fallbackAspect;

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

      {resolved && isVideo && sound && !reduced && (
        <button
          type="button"
          className={styles.sound}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            const next = !muted;
            setMuted(next);
            video.muted = next;
            if (!next) video.play().catch(() => {});
          }}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      )}

      {children}
    </div>
  );
}
