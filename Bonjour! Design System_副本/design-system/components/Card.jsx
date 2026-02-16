import React from 'react';
import { colors, radius, spacing } from '../tokens';

export const Card = ({ children, style, onClick }) => {
  const cardStyles = {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    padding: spacing.lg,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
    ...style,
  };

  return (
    <div style={cardStyles} onClick={onClick}>
      {children}
    </div>
  );
};
