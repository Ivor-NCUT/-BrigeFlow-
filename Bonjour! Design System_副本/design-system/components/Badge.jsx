import React from 'react';
import { colors, typography, spacing, radius } from '../tokens';

export const Badge = ({ count, dot, children, style, color = colors.error }) => {
  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    ...style,
  };

  const badgeStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    transform: 'translate(50%, -50%)',
    backgroundColor: color,
    color: colors.white,
    borderRadius: radius.round,
    padding: dot ? '0' : `0 ${spacing.xs}`,
    minWidth: dot ? '8px' : '18px',
    height: dot ? '8px' : '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: typography.weights.bold,
    lineHeight: 1,
    zIndex: 1,
    boxShadow: `0 0 0 2px ${colors.background}`, // white border for better contrast
  };

  return (
    <div style={containerStyle}>
      {children}
      {(count > 0 || dot) && (
        <div style={badgeStyle}>
          {!dot && (count > 99 ? '99+' : count)}
        </div>
      )}
    </div>
  );
};
