import React from 'react';
import { colors, typography, spacing, radius } from '../tokens';

export const Tag = ({ children, selected = false, onClick, style }) => {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.xs} ${spacing.lg}`,
    borderRadius: radius.round,
    backgroundColor: selected ? colors.primary : colors.fillQuaternary,
    color: selected ? colors.white : colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    border: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };

  if (onClick) {
    return (
      <button onClick={onClick} style={styles}>
        {children}
      </button>
    );
  }

  return (
    <div style={styles}>
      {children}
    </div>
  );
};
