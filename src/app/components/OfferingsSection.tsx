'use client';

import { useState } from 'react';
import styles from '../Styles/components/OfferingsSection.module.css';
import heroStyles from '../Styles/components/HeroSection.module.css';
import LoginPage from './LoginPage';
import SignupPage from './SignUp';
// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconSkills = () => (
  <svg className={styles.iconSvg} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 22 L5 10 Q5 8 7 8 L23 8 Q25 8 25 10 L25 22" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="3" y1="22" x2="27" y2="22" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="15" y1="22" x2="15" y2="25" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="11" y1="25" x2="19" y2="25" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" />
    <polyline points="9,18 13,13 17,16 21,11" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="21" cy="11" r="1.5" fill="#c9a84c" />
  </svg>
);

const IconLeadership = () => (
  <svg className={styles.iconSvg} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="15,4 17.5,11 25,11 19,15.5 21.5,22.5 15,18 8.5,22.5 11,15.5 5,11 12.5,11"
      stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(201,168,76,0.12)"
    />
    <line x1="15" y1="22.5" x2="15" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="26"   x2="19" y2="26" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconTeamwork = () => (
  <svg className={styles.iconSvg} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3.5" stroke="#c9a84c" strokeWidth="1.5" />
    <circle cx="20" cy="10" r="3.5" stroke="#c9a84c" strokeWidth="1.5" />
    <path d="M4 24 C4 19 7 17 10 17 C13 17 16 19 16 24"  stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 24 C14 19 17 17 20 17 C23 17 26 19 26 24" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15" y1="13" x2="15" y2="17" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="2 2" />
  </svg>
);

const IconInnovation = () => (
  <svg className={styles.iconSvg} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 5 C10 5 7 8.5 7 12.5 C7 15.5 8.5 18 11 19.5 L11 22 L19 22 L19 19.5 C21.5 18 23 15.5 23 12.5 C23 8.5 20 5 15 5Z"
      stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.1)" strokeLinejoin="round"
    />
    <line x1="11"   y1="24"   x2="19"   y2="24"   stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12"   y1="26.5" x2="18"   y2="26.5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15"   y1="9"    x2="15"   y2="16"   stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <line x1="11.5" y1="12.5" x2="18.5" y2="12.5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const cards = [
  {
    id: 'skills',
    Icon: IconSkills,
    title: 'تطوير المهارات',
    desc: 'برامج تدريبية متقدمة لتطوير المهارات الشخصية والمهنية وتهيئتك لسوق العمل.',
  },
  {
    id: 'leadership',
    Icon: IconLeadership,
    title: 'القيادة',
    desc: 'فرص قيادية حقيقية لتطوير مهارات القيادة والإدارة وبناء شخصية قادرة على التأثير.',
  },
  {
    id: 'teamwork',
    Icon: IconTeamwork,
    title: 'العمل الجماعي',
    desc: 'مشاريع تعاونية تعزز روح الفريق والتعاون الفعال بين الطلاب من مختلف التخصصات.',
  },
  {
    id: 'innovation',
    Icon: IconInnovation,
    title: 'الابتكار',
    desc: 'بيئة محفزة للإبداع والابتكار وتطوير الأفكار الجديدة التي تحدث فرقاً حقيقياً.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OfferingsSection() {
    const [showModal, setShowModal] = useState(false);
  const [activeScreen, setActiveScreen] = useState('signup');
 return (
    <>
      <section className={styles.section}>

        <div className={styles.header}>
          <h2 className={styles.title}>
            ما <span className={styles.titleAccent}>نقدمه</span> لك
          </h2>
          <p className={styles.subtitle}>
            استثمر في نفسك واكتسب المهارات التي تحتاجها للنجاح
          </p>
        </div>

        <div className={styles.grid}>
          {cards.map(({ id, Icon, title, desc }) => (
            <div key={id} className={styles.card}>
              <div className={styles.iconWrap}>
                <Icon />
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardDesc}>{desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.ctaWrap}>
          <button
            className={styles.cta}
            onClick={() => { setActiveScreen('signup'); setShowModal(true); }}
          >
            ابدأ رحلتك الآن
            <span className={styles.ctaArrow}>←</span>
          </button>
        </div>

      </section>

      {/* Modal */}
      {showModal && (
        <div className={heroStyles.fullScreenOverlay}>
          <div className={heroStyles.modalCard}>
            {activeScreen === 'login' ? (
              <LoginPage
                onClose={() => setShowModal(false)}
                onSwitchToSignup={() => setActiveScreen('signup')}
              />
            ) : (
              <SignupPage
                onClose={() => setShowModal(false)}
                onSwitchToLogin={() => setActiveScreen('login')}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}