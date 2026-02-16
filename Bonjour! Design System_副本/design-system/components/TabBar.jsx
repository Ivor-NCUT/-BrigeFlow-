import React from 'react';
import { colors, spacing, typography } from '../tokens';

export const TabBar = ({ items, style }) => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '50px', // Standard tab bar height
      backgroundColor: colors.background,
      borderTop: `1px solid ${colors.border}`,
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)', // Handle iPhone X notch
      ...style,
    },
    item: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      height: '100%',
    },
    label: (active) => ({
      fontSize: '10px',
      marginTop: '4px',
      color: active ? colors.primary : colors.textSecondary,
      fontWeight: active ? typography.weights.medium : typography.weights.regular,
    }),
    icon: (active) => ({
        fontSize: '24px',
        color: active ? colors.primary : colors.textSecondary,
    })
  };

  return (
    <div style={styles.container}>
      {items.map((item, index) => (
        <div 
          key={index} 
          style={styles.item} 
          onClick={item.onClick}
        >
          <div style={styles.icon(item.active)}>{item.icon}</div>
          {item.label && (
            <span style={styles.label(item.active)}>{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
};
