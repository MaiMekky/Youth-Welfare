/**
 * Reusable Button Component
 * Professional button with consistent styling and variants
 */
import React from 'react';
import styles from '../../styles/components/Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
}) => {
  const classes = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth && styles['button--fullWidth'],
    iconOnly && styles['button--iconOnly'],
    loading && styles['button--loading'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {icon && iconPosition === 'left' && (
        <span className={styles.buttonIcon}>{icon}</span>
      )}
      {!iconOnly && children}
      {icon && iconPosition === 'right' && (
        <span className={styles.buttonIcon}>{icon}</span>
      )}
    </button>
  );
};
