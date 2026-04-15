import { MOOD_TAGS } from "../../utils/helpers";
import styles from "./MoodFilter.module.css";

const MoodFilter = ({ active, onChange }) => (
  <div className={styles.row}>
    <button
      className={`${styles.pill} ${!active ? styles.active : ""}`}
      onClick={() => onChange(null)}
    >
      All
    </button>
    {MOOD_TAGS.map((mood) => (
      <button
        key={mood}
        className={`${styles.pill} ${active === mood ? styles.active : ""}`}
        onClick={() => onChange(mood)}
      >
        {mood}
      </button>
    ))}
  </div>
);

export default MoodFilter;
