"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/EventsPage.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string; badge?: string | number }[];
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = wrapRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const x = el.scrollLeft;
    setCanScroll(max > 2);
    setAtStart(x <= 2);
    setAtEnd(x >= max - 2);
  };

  useEffect(() => {
    sync();
    const el = wrapRef.current;
    if (!el) return;

    const onScroll = () => sync();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
    };
  }, [items.length]);

  const scrollByAmount = (dir: "prev" | "next") => {
    const el = wrapRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.65);
    el.scrollBy({
      left: dir === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.tabsContainer}>
      {canScroll && (
        <button
          type="button"
          className={styles.scrollButton}
          onClick={() => scrollByAmount("prev")}
          disabled={atStart}
          aria-label="السابق"
          title="السابق"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div ref={wrapRef} className={styles.tabsWrapper}>
        {items.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => onChange(t.key)}
            >
              {t.label}

              {t.badge !== undefined && t.badge !== null && (
                <span className={styles.notificationBadge}>{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {canScroll && (
        <button
          type="button"
          className={styles.scrollButton}
          onClick={() => scrollByAmount("next")}
          disabled={atEnd}
          aria-label="التالي"
          title="التالي"
        >
          <ChevronLeft size={18} />
        </button>
      )}
    </div>
  );
}
