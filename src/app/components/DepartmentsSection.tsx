'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/components/DepartmentsSection.module.css';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconCultural = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 20h20M6 20V10M10 20V4M14 20V10M18 20V4" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="10" cy="4" r="1.5" fill="#c9a84c" opacity="0.7" />
    <circle cx="18" cy="4" r="1.5" fill="#c9a84c" opacity="0.7" />
  </svg>
);

const IconSocial = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9"  cy="8"  r="3" stroke="#c9a84c" strokeWidth="1.6" />
    <circle cx="17" cy="8"  r="2.5" stroke="#c9a84c" strokeWidth="1.4" opacity="0.7" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M17 14c1.66 0 3 1.34 3 3v1" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const IconSports = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#c9a84c" strokeWidth="1.6" />
    <path d="M12 3c0 0 3 4 3 9s-3 9-3 9" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <path d="M3 12h18" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    <path d="M4.5 7.5c2 .5 4.5.5 7.5 0s5.5.5 7.5 0" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    <path d="M4.5 16.5c2-.5 4.5-.5 7.5 0s5.5-.5 7.5 0" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const IconFamilies = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3"  y="3"  width="7" height="7" rx="2" stroke="#c9a84c" strokeWidth="1.6" />
    <rect x="14" y="3"  width="7" height="7" rx="2" stroke="#c9a84c" strokeWidth="1.6" opacity="0.7" />
    <rect x="3"  y="14" width="7" height="7" rx="2" stroke="#c9a84c" strokeWidth="1.6" opacity="0.7" />
    <rect x="14" y="14" width="7" height="7" rx="2" stroke="#c9a84c" strokeWidth="1.6" opacity="0.45" />
    <line x1="10" y1="6.5" x2="14" y2="6.5" stroke="#c9a84c" strokeWidth="1.3" strokeOpacity="0.5" />
    <line x1="6.5" y1="10" x2="6.5" y2="14" stroke="#c9a84c" strokeWidth="1.3" strokeOpacity="0.5" />
    <line x1="17.5" y1="10" x2="17.5" y2="14" stroke="#c9a84c" strokeWidth="1.3" strokeOpacity="0.5" />
    <line x1="10" y1="17.5" x2="14" y2="17.5" stroke="#c9a84c" strokeWidth="1.3" strokeOpacity="0.5" />
  </svg>
);

const IconScience = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3v8L4 19h16l-5-8V3" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" y1="3" x2="15" y2="3" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="9"  cy="14" r="1.2" fill="#c9a84c" opacity="0.7" />
    <circle cx="14" cy="16" r="1"   fill="#c9a84c" opacity="0.5" />
    <circle cx="11" cy="17" r="0.8" fill="#c9a84c" opacity="0.4" />
  </svg>
);

const IconWelfare = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 4 15 4 9a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 12-8 12z"
      stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="rgba(201,168,76,0.08)" />
    <line x1="12" y1="9" x2="12" y2="14" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="9.5" y1="11.5" x2="14.5" y2="11.5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconScouts = () => (
  <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,3 15,9 21,9 16.5,13.5 18,20 12,16.5 6,20 7.5,13.5 3,9 9,9"
      stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(201,168,76,0.08)" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const departments = [
  {
    id: 'cultural',
    name: 'إدارة النشاط الثقافي والفني',
    Icon: IconCultural,
    desc: 'تنظيم المحاضرات والندوات الثقافية، المعارض الفنية، العروض المسرحية والموسيقية، والمسابقات الأدبية والإبداعية',
  },
  {
    id: 'social',
    name: 'إدارة النشاط الاجتماعي',
    Icon: IconSocial,
    desc: 'تنظيم الفعاليات الاجتماعية والاحتفالات، تعزيز الترابط بين الطلاب، وإدارة المبادرات المجتمعية داخل الجامعة',
  },
  {
    id: 'sports',
    name: 'إدارة النشاط الرياضي والرحلات',
    Icon: IconSports,
    desc: 'تنظيم البطولات والدورات الرياضية، الإشراف على الأندية الرياضية والفرق الجامعية، وتنظيم الرحلات الترفيهية والتعليمية',
  },
  {
    id: 'families',
    name: 'إدارة الأسر الطلابية والاتحادات',
    Icon: IconFamilies,
    desc: 'الإشراف على تكوين وتنظيم الأسر الطلابية، تنسيق عمل الاتحادات الطلابية، ودعم المبادرات والأنشطة الطلابية',
  },
  {
    id: 'science',
    name: 'إدارة النشاط العلمي والتكنولوجي',
    Icon: IconScience,
    desc: 'دعم البحث العلمي، تنظيم المسابقات الأكاديمية والتقنية، المؤتمرات الطلابية، وورش العمل التكنولوجية',
  },
  {
    id: 'welfare',
    name: 'إدارة التكافل الاجتماعي',
    Icon: IconWelfare,
    desc: 'تقديم الدعم المالي والاجتماعي للطلاب المحتاجين، متابعة الحالات الاجتماعية، وتنفيذ برامج الرعاية الطلابية',
  },
  {
    id: 'scouts',
    name: 'إدارة الجوالة والخدمة العامة والمعسكرات',
    Icon: IconScouts,
    desc: 'تدريب الطلاب على الإسعافات الأولية والقيادة، تنظيم المعسكرات الصيفية والشتوية، والمشاركة في الخدمة المجتمعية',
  },
];

function useScrollReveal() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const observers = refs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // stagger delay based on index
            setTimeout(() => {
              setVisible(prev => ({ ...prev, [i]: true }));
            }, i * 80);
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return { refs, visible };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DepartmentsSection() {
  const [openId, setOpenId] = useState<string | null>('cultural'); // first open by default
  const { refs, visible } = useScrollReveal();

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id));

  return (
    <section className={styles.section}>

      {/* Badge */}
      <div className={styles.badge}>
        <span className={styles.badgeDot} />
        <span className={styles.badgeText}>الإدارات الفرعية</span>
      </div>

      {/* Title */}
      <h2 className={styles.title}>
        الإدارات <span className={styles.titleAccent}>الحالية</span>
      </h2>

      {/* Subtitle */}
      <p className={styles.subtitle}>
        7 إدارات متخصصة تعمل معاً لتوفير أفضل تجربة جامعية
      </p>

      {/* Accordion list */}
      <div className={styles.list}>
        {departments.map(({ id, name, Icon, desc }, i) => {
          const isOpen = openId === id;
          return (
            <div
              key={id}
              ref={el => { refs.current[i] = el; }}
              className={`${styles.item} ${isOpen ? styles.itemOpen : ''} ${visible[i] ? styles.visible : ''}`}
              style={{ animationDelay: visible[i] ? `${i * 0.08}s` : '0s' }}
            >
              <button
                className={styles.trigger}
                onClick={() => toggle(id)}
                aria-expanded={isOpen}
              >


                {/* Right side: name + icon */}
                <div className={styles.triggerRight}>
                      <div className={styles.iconBox}>
                    <Icon />
                  </div>
                  <span className={styles.itemName}>{name}</span>
                </div>

                <svg
                  className={styles.chevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Expandable panel */}
              <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
                <div className={styles.separator} />
                <p className={styles.panelText}>{desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className={styles.note}>
        <p className={styles.noteText}>
          جميع الإدارات تعمل تحت إشراف{' '}
          <span className={styles.noteHighlight}>الإدارة العامة لرعاية الطلاب</span>{' '}
          لضمان تقديم أفضل الخدمات للطلاب
        </p>
      </div>

    </section>
  );
}