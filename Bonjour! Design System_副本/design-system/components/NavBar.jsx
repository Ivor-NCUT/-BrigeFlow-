import React from 'react';
import { colors, spacing, typography } from '../tokens';

export const NavBar = ({ 
  title, 
  left, 
  right, 
  style,
  onLeftClick,
  onRightClick
}) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '44px',
      padding: `0 ${spacing.md}`,
      backgroundColor: colors.background,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: `1px solid ${colors.border}`,
      ...style,
    },
    left: {
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-start',
      cursor: onLeftClick ? 'pointer' : 'default',
    },
    title: {
      flex: 2,
      textAlign: 'center',
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    right: {
      flex: 1,
      display: 'flex',
      justifyContent: 'flex-end',
      cursor: onRightClick ? 'pointer' : 'default',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.left} onClick={onLeftClick}>
        {left}
      </div>
      <div style={styles.title}>
        {title}
      </div>
      <div style={styles.right} onClick={onRightClick}>
        {right}
      </div>
    </div>
  );
};
