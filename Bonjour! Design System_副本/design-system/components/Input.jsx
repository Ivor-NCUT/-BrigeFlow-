import React, { useRef, useState } from 'react';
import { colors, typography, spacing, radius } from '../tokens';

export const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  onImageUpload, 
  type = 'text', 
  startEnhancer,
  endEnhancer,
  style 
}) => {
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (onImageUpload) {
          onImageUpload(blob);
          e.preventDefault();
        }
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0] && onImageUpload) {
      onImageUpload(e.target.files[0]);
    }
  };

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.lg,
    padding: `${spacing.sm} ${spacing.md}`,
    border: isFocused ? `1px solid ${colors.primary}` : `1px solid transparent`,
    transition: 'border-color 0.2s',
    ...style,
  };

  const inputStyles = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: '24px',
  };

  return (
    <div style={containerStyles}>
      {startEnhancer && <div style={{ marginRight: spacing.sm }}>{startEnhancer}</div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        placeholder={placeholder}
        style={inputStyles}
      />
      {onImageUpload && (
        <div 
            style={{ marginLeft: spacing.sm, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
        >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8l-5-5-5 5" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3v12" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
             <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange}
             />
        </div>
      )}
      {endEnhancer && <div style={{ marginLeft: spacing.sm }}>{endEnhancer}</div>}
    </div>
  );
};
