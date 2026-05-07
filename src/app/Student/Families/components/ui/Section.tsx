/**
 * Section Component
 * Professional section wrapper with header and body
 */
import React from 'react';
import styles from '../../styles/components/Section.module.css';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, className = '' }) => {
  return <div className={`${styles.section} ${className}`}>{children}</div>;
};

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string | number;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className={styles.sectionHeader}>
      {icon && <div className={styles.sectionIcon}>{icon}</div>}
      <div className={styles.sectionText}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
      {badge !== undefined && (
        <span className={styles.sectionBadge}>{badge}</span>
      )}
      {action && <div className={styles.sectionAction}>{action}</div>}
    </div>
  );
};

interface SectionBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionBody: React.FC<SectionBodyProps> = ({ children, className = '' }) => {
  return <div className={`${styles.sectionBody} ${className}`}>{children}</div>;
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className={styles.emptyState}>
      {icon}
      <p className={styles.emptyStateTitle}>{title}</p>
      {description && <p className={styles.emptyStateDescription}>{description}</p>}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>{message}</p>
    </div>
  );
};
