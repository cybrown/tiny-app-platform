import { TabsProps } from "../../theme";
import styles from "./Tabs.module.css";

export function Tabs({ tabs, value, onChange, after }: TabsProps) {
  return (
    <div className={"mc-tabs " + styles.Tabs}>
      <ul className="mc-tabs__nav" role="tablist" aria-label="Example of Tabs">
        {tabs.map((tab) => (
          <li className="mc-tabs__item" role="presentation" key={tab.value}>
            <a
              href="#/tab"
              onClick={(e) => {
                onChange(tab.value);
                e.preventDefault();
              }}
              role="tab"
              aria-selected={value === tab.value ? "true" : undefined}
              className={`mc-tabs__element ${
                value === tab.value ? "mc-tabs__element--selected" : ""
              }`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
      {after}
    </div>
  );
}
