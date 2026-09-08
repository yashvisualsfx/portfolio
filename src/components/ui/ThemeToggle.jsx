import styles from "./ThemeToggle.module.css";

/**
 * Light/dark switch.
 *
 * `aria-pressed` rather than a checkbox: this toggles a mode that is already
 * applied, so the accessible name stays constant ("Light mode") and the
 * pressed state carries whether it is on — a label that flips between
 * "Light"/"Dark" reads ambiguously, since it is unclear whether it names the
 * current state or the action.
 *
 * @param {"light"|"dark"} theme   the resolved theme
 * @param {() => void}     onToggle
 */
export function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={styles.root}
      onClick={onToggle}
      aria-pressed={isLight}
      aria-label="Light mode"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.mark} />
      </span>
      <span className={styles.label} aria-hidden="true">
        {isLight ? "Light" : "Dark"}
      </span>
    </button>
  );
}
