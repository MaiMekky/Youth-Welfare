// components/Tabs.tsx
'use client';

import { useRef } from 'react';
import styles from '@/app/uni-level-family/Styles/Tabs.module.css';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const tabsWrapperRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (tabsWrapperRef.current) {
      tabsWrapperRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tabsWrapperRef.current) {
      tabsWrapperRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsWrapper} ref={tabsWrapperRef}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}