/**
 * Accepted Family Card Component
 * Displays a family that the student has been accepted into
 */
import React from 'react';
import styles from '../../styles/components/FamilyCard.module.css';
import type { ProgramFamily } from '../../types';

interface AcceptedFamilyCardProps {
  family: ProgramFamily;
  onViewDetails: (family: ProgramFamily) => void;
}

const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconLocation = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconMembers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const AcceptedFamilyCard: React.FC<AcceptedFamilyCardProps> = ({
  family,
  onViewDetails,
}) => {
  return (
    <div className={styles.acceptedCard}>
      <div className={styles.cardContent}>
        <div className={styles.cardTop}>
          <div className={styles.cardIconWrapper}>
            <IconUsers />
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{family.title}</h3>
          </div>
        </div>

        {family.subtitle && (
          <p className={styles.cardDescription}>{family.subtitle}</p>
        )}

        <div className={styles.cardMeta}>
          {family.place && (
            <div className={styles.metaChip}>
              <IconLocation />
              {family.place}
            </div>
          )}
          {family.views && (
            <div className={styles.metaChip}>
              <IconMembers />
              {family.views}
            </div>
          )}
          {family.createdAt && (
            <div className={styles.metaChip}>
              <IconCalendar />
              {family.createdAt}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          className={styles.viewButton}
          onClick={() => onViewDetails(family)}
        >
          <IconEye />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
};
