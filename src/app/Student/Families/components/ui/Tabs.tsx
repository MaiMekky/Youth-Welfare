/**
 * Tabs Component
 * Professional tabs with smooth transitions
 */
import React from 'react';
import styles from '../../styles/components/Tabs.module.css';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
}) => {
  return (
    <div className={`${styles.tabsContainer} ${styles[`tabs--${variant}`]}`}>
      <div className={styles.tabsList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles['tabButton--active'] : ''
            }`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`${styles.tabCount} ${
                  activeTab === tab.id ? styles['tabCount--active'] : ''
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  activeValue: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, activeValue }) => {
  if (value !== activeValue) return null;

  return <div className={styles.tabPanel}>{children}</div>;
};
