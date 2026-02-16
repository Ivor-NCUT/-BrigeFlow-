import React from 'react';
import { colors, typography, spacing } from '../tokens';

export const ListItem = ({ 
  leftContent, 
  title, 
  description, 
  rightContent, 
  onClick,
  style,
  noBorder = false
}) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: colors.background,
    borderBottom: noBorder ? 'none' : `1px solid ${colors.fillQuaternary}`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background-color 0.2s',
    ...style,
  };

  const contentStyle = {
    flex: 1,
    marginLeft: leftContent ? spacing.md : 0,
    marginRight: rightContent ? spacing.md : 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
  };

  const titleStyle = {
    color: colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const descStyle = {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div 
      style={containerStyle} 
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.backgroundColor = colors.background;
      }}
    >
      {leftContent}
      <div style={contentStyle}>
        {title && <div style={titleStyle}>{title}</div>}
        {description && <div style={descStyle}>{description}</div>}
      </div>
      {rightContent}
    </div>
  );
};
