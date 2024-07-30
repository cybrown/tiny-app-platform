import { TabsProps } from "../../theme";
import styles from "./Tabs.module.css";

export default function Tabs({ onChange, after, tabs, value }: TabsProps) {
  return (
    <ul className={`nav nav-tabs ${styles.Tabs}`}>
      {tabs.map((tab) => (
        <li className="nav-item" key={tab.value}>
          <a
            className={`nav-link ${value === tab.value ? "active" : ""}`}
            href="#tabs"
            onClick={(e) => {
              onChange && onChange(tab.value);
              e.preventDefault();
            }}
          >
            {tab.label}
          </a>
        </li>
      ))}
      {after ? (
        <>
          <div className={styles.afterSpacer} />
          {after}
        </>
      ) : null}
    </ul>
  );
}
