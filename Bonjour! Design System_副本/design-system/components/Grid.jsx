import React from 'react';
import { spacing } from '../tokens';

export const Grid = ({ 
  children, 
  columns = 2, 
  gap = spacing.md, 
  style 
}) => {
  const styles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap,
    width: '100%',
    ...style,
  };

  return (
    <div style={styles}>
      {children}
    </div>
  );
};
