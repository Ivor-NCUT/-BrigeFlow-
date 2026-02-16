import React from 'react';
import { colors, radius } from '../tokens';

export const Avatar = ({ src, alt, size = 'medium', shape = 'circle', style }) => {
  const sizeMap = {
    small: '32px',
    medium: '40px',
    large: '48px',
    xlarge: '64px',
    xxlarge: '80px',
  };

  const styles = {
    width: sizeMap[size] || sizeMap.medium,
    height: sizeMap[size] || sizeMap.medium,
    borderRadius: shape === 'circle' ? radius.circle : radius.md,
    objectFit: 'cover',
    backgroundColor: colors.fillQuaternary,
    flexShrink: 0,
    ...style,
  };

  if (!src) {
    return (
      <div 
        style={{ 
          ...styles, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: colors.secondary,
          fontSize: '14px',
          fontWeight: 600
        }}
      >
        {alt?.[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  return <img src={src} alt={alt} style={styles} />;
};
