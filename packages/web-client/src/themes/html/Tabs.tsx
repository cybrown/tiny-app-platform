import { TabsProps } from "../../theme";

export default function Tabs({ value, onChange, tabs, after }: TabsProps) {
  return (
    <menu role="tablist">
      {tabs.map((tab, index) => (
        <li role="tab" key={index} aria-selected={tab.value === value}>
          <a
            href="#tabs"
            onClick={(e) => {
              onChange(tab.value);
              e.preventDefault();
            }}
          >
            {tab.label}
          </a>
        </li>
      ))}
      {after ? <div style={{ flexGrow: 1 }}></div> : null}
      {after}
    </menu>
  );
}
