"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../Styles/components/FamiliesSection.module.css';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IconCentral = () => (
  <svg className={styles.iconSvg} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="3.5" fill="#c9a84c" />
    <circle cx="16" cy="7"  r="2.5" fill="#c9a84c" opacity="0.7" />
    <circle cx="16" cy="25" r="2.5" fill="#c9a84c" opacity="0.7" />
    <circle cx="7"  cy="16" r="2.5" fill="#c9a84c" opacity="0.7" />
    <circle cx="25" cy="16" r="2.5" fill="#c9a84c" opacity="0.7" />
    <line x1="16" y1="12.5" x2="16" y2="9.5"  stroke="#c9a84c" strokeWidth="1.4" strokeOpacity="0.5" />
    <line x1="16" y1="19.5" x2="16" y2="22.5" stroke="#c9a84c" strokeWidth="1.4" strokeOpacity="0.5" />
    <line x1="12.5" y1="16" x2="9.5"  y2="16" stroke="#c9a84c" strokeWidth="1.4" strokeOpacity="0.5" />
    <line x1="19.5" y1="16" x2="22.5" y2="16" stroke="#c9a84c" strokeWidth="1.4" strokeOpacity="0.5" />
    <circle cx="16" cy="16" r="10" stroke="#c9a84c" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />
  </svg>
);

const IconSpecialized = () => (
  <svg className={styles.iconSvg} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4"  y="4"  width="10" height="10" rx="3" fill="#3b82f6" opacity="0.8" />
    <rect x="18" y="4"  width="10" height="10" rx="3" fill="#3b82f6" opacity="0.5" />
    <rect x="4"  y="18" width="10" height="10" rx="3" fill="#3b82f6" opacity="0.5" />
    <rect x="18" y="18" width="10" height="10" rx="3" fill="#3b82f6" opacity="0.3" />
    <line x1="14" y1="9"  x2="18" y2="9"  stroke="#3b82f6" strokeWidth="1.4" strokeOpacity="0.6" />
    <line x1="9"  y1="14" x2="9"  y2="18" stroke="#3b82f6" strokeWidth="1.4" strokeOpacity="0.6" />
    <line x1="23" y1="14" x2="23" y2="18" stroke="#3b82f6" strokeWidth="1.4" strokeOpacity="0.6" />
    <line x1="14" y1="23" x2="18" y2="23" stroke="#3b82f6" strokeWidth="1.4" strokeOpacity="0.6" />
  </svg>
);

const IconEco = () => (
  <svg className={styles.iconSvg} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 4 C22 4 28 10 28 18 C28 18 22 16 16 20 C10 24 8 28 8 28 C8 28 6 22 8 16 C10 10 10 4 16 4Z"
      fill="#22c55e" opacity="0.85"
    />
    <path d="M8 28 Q12 22 16 16" stroke="#22c55e" strokeWidth="1.6" strokeOpacity="0.5" strokeLinecap="round" />
    <path d="M16 4 Q18 12 16 20" stroke="white" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
  </svg>
);

// ─── Card Data ────────────────────────────────────────────────────────────────

const cards = [
  {
    id: 'central',
    style: styles.cardGold,
    iconWrapStyle: styles.iconWrapGold,
    Icon: IconCentral,
    title: 'الأسرة المركزية',
    desc: 'الأسرة الرئيسية التي تنظم الفعاليات الكبرى وتنسق بين جميع الأسر النوعية، وتعمل على بناء روح الانتماء والوحدة بين أبناء الجامعة.',
  },
  {
    id: 'specialized',
    style: styles.cardBlue,
    iconWrapStyle: styles.iconWrapBlue,
    Icon: IconSpecialized,
    title: 'الأسر النوعية',
    desc: 'أسر متخصصة في مجالات محددة مثل الفنون، الرياضة، التكنولوجيا، والثقافة؛ توفر بيئة احترافية لتطوير المهارات وصقل المواهب.',
  },
  {
    id: 'eco',
    style: styles.cardGreen,
    iconWrapStyle: styles.iconWrapGreen,
    Icon: IconEco,
    title: 'أسر أصدقاء البيئة',
    desc: 'مجتمع طلابي يسعى إلى نشر الوعي البيئي وتطبيق مبادئ الاستدامة داخل الحرم الجامعي، من خلال مبادرات خضراء وأنشطة ترفع الوعي بحماية كوكبنا.',
  },
];

// ─── Scroll hook ──────────────────────────────────────────────────────────────

function useScrollVisible(threshold = 0.18) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FamiliesSection() {
  const { ref: sectionRef,   visible: sectionVisible  } = useScrollVisible(0.05);
  const { ref: badgeRef,     visible: badgeVisible    } = useScrollVisible(0.5);
  const { ref: headingRef,   visible: headingVisible  } = useScrollVisible(0.5);
  const { ref: subRef,       visible: subVisible      } = useScrollVisible(0.5);
  const { ref: gridRef,      visible: gridVisible     } = useScrollVisible(0.1);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`${styles.section} ${sectionVisible ? styles.sectionVisible : ''}`}
    >
      <div
        ref={badgeRef as React.RefObject<HTMLDivElement>}
        className={`${styles.badge} ${badgeVisible ? styles.visible : ''}`}
      >
        <span className={styles.badgeDot} />
        <span className={styles.badgeText}>الأسر الطلابية</span>
      </div>

      <h2
        ref={headingRef as React.RefObject<HTMLHeadingElement>}
        className={`${styles.heading} ${headingVisible ? styles.visible : ''}`}
      >
        انضم إلى{' '}
        <span className={styles.headingAccent}>أسرتك</span>{' '}
        الجامعية
      </h2>

      <p
        ref={subRef as React.RefObject<HTMLParagraphElement>}
        className={`${styles.subheading} ${subVisible ? styles.visible : ''}`}
      >
        نظام الأسر الطلابية — مكان لتطوير مهاراتك والمشاركة في أنشطة متنوعة تجمعك بزملائك وتُثري تجربتك الجامعية
      </p>

      <div
        ref={gridRef as React.RefObject<HTMLDivElement>}
        className={styles.grid}
      >
        {cards.map(({ id, style, iconWrapStyle, Icon, title, desc }) => (
          <div key={id} className={`${styles.card} ${style} ${gridVisible ? styles.visible : ''}`}>
            <div className={`${styles.iconWrap} ${iconWrapStyle}`}>
              <Icon />
            </div>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDesc}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}