/**
 * Reusable Card Component
 * Professional card wrapper with consistent styling
 */
import React from 'react';
import styles from '../../styles/components/Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hover = false,
}) => {
  const classes = [
    styles.card,
    styles[`card--${variant}`],
    styles[`card--padding-${padding}`],
    hover && styles['card--hover'],
    onClick && styles['card--clickable'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string | number;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  icon,
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className={styles.cardHeader}>
      {icon && <div className={styles.cardIcon}>{icon}</div>}
      <div className={styles.cardHeaderText}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
      </div>
      {badge !== undefined && (
        <span className={styles.cardBadge}>{badge}</span>
      )}
      {action && <div className={styles.cardAction}>{action}</div>}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`${styles.cardBody} ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`${styles.cardFooter} ${className}`}>{children}</div>;
};
