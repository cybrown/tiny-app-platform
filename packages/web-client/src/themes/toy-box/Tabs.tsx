import styles from "./Tabs.module.css";
import { TabsProps, Text } from "../../theme";

export default function Tabs({ value, onChange, tabs, after }: TabsProps) {
  return (
    <div>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.value}
            className={`${styles.tab} ${
              tab.value === value ? styles.selected : ""
            }`}
            onClick={() => onChange(tab.value)}
          >
            <Text text={tab.label} />
          </div>
        ))}
        <div className={styles.tabSpacer}>{after}</div>
      </div>
    </div>
  );
}
