import React from 'react';
import { colors, typography, spacing, radius } from '../tokens';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  style 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
    borderRadius: radius.round,
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    ...style,
  };

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.fillQuaternary,
      color: colors.textPrimary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
    },
  };

  const sizes = {
    small: {
      padding: `${spacing.xs} ${spacing.md}`,
      fontSize: typography.sizes.sm,
      height: '28px',
    },
    medium: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.sizes.md,
      height: '36px',
    },
    large: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.sizes.lg,
      height: '44px',
    },
    huge: {
        padding: `${spacing.lg} ${spacing.xxl}`,
        fontSize: typography.sizes.xl,
        height: '56px',
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
      }}
    >
      {children}
    </button>
  );
};
