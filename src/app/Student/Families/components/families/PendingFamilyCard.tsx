/**
 * Pending Family Card Component
 * Displays a family with pending membership status
 */
import React from 'react';
import styles from '../../styles/components/FamilyCard.module.css';
import type { ProgramFamily } from '../../types';

interface PendingFamilyCardProps {
  family: ProgramFamily;
}

const getStatusBadgeClass = (status: string): string => {
  const s = status.toLowerCase().trim();
  if (s === 'منتظر' || s === 'pending') return styles['statusBadge--pending'];
  if (s === 'مقبول' || s === 'accepted' || s === 'active') return styles['statusBadge--accepted'];
  if (s === 'مرفوض' || s === 'rejected') return styles['statusBadge--rejected'];
  return styles['statusBadge--pending'];
};

const getStatusText = (status: string): string => {
  const s = status.toLowerCase().trim();
  if (s === 'pending') return 'منتظر';
  if (s === 'accepted' || s === 'active') return 'مقبول';
  if (s === 'rejected') return 'مرفوض';
  return status;
};

const getStatusIcon = (status: string): string => {
  const s = status.toLowerCase().trim();
  if (s === 'منتظر' || s === 'pending') return '⏳';
  if (s === 'مقبول' || s === 'accepted' || s === 'active') return '✓';
  if (s === 'مرفوض' || s === 'rejected') return '✕';
  return '⏳';
};

export const PendingFamilyCard: React.FC<PendingFamilyCardProps> = ({ family }) => {
  const statusClass = getStatusBadgeClass(family.memberStatus);
  const statusText = getStatusText(family.memberStatus);
  const statusIcon = getStatusIcon(family.memberStatus);

  return (
    <div className={styles.pendingCard}>
      <div className={styles.pendingLeft}>
        <div className={styles.statusIndicator} />
        <div className={styles.pendingInfo}>
          <h3 className={styles.pendingTitle}>{family.title}</h3>
          {family.subtitle && (
            <p className={styles.pendingDescription}>{family.subtitle}</p>
          )}
        </div>
      </div>
      <div className={styles.pendingRight}>
        <span className={`${styles.statusBadge} ${statusClass}`}>
          {statusIcon} {statusText}
        </span>
      </div>
    </div>
  );
};
