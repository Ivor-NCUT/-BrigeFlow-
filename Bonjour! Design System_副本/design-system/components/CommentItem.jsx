import React from 'react';
import { colors, spacing, typography, radius } from '../tokens';
import { Avatar } from './Avatar';

export const CommentItem = ({ 
  avatar, 
  name, 
  time, 
  location, 
  content, 
  children, // For nested comments
  isChild = false,
  onReply
}) => {
  const styles = {
    container: {
      display: 'flex',
      padding: `${spacing.md} 0`,
      borderBottom: isChild ? 'none' : `1px solid ${colors.border}`,
    },
    avatarContainer: {
      marginRight: spacing.sm,
    },
    contentContainer: {
      flex: 1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    nameInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
    },
    name: {
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.bold,
      color: colors.textPrimary,
    },
    meta: {
      fontSize: typography.sizes.xs,
      color: colors.textTertiary,
      display: 'flex',
      gap: spacing.xs,
    },
    body: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      lineHeight: 1.5,
      marginBottom: spacing.sm,
    },
    actions: {
        display: 'flex',
        gap: spacing.md,
    },
    actionText: {
        fontSize: typography.sizes.sm,
        color: colors.textTertiary,
        cursor: 'pointer',
    },
    nestedContainer: {
        marginTop: spacing.sm,
        paddingLeft: spacing.md,
        borderLeft: `2px solid ${colors.border}`,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.avatarContainer}>
        <Avatar src={avatar} name={name} size={isChild ? "small" : "medium"} />
      </div>
      <div style={styles.contentContainer}>
        <div style={styles.header}>
            <div style={styles.nameInfo}>
                <span style={styles.name}>{name}</span>
                <div style={styles.meta}>
                    <span>{time}</span>
                    {location && <span>· {location}</span>}
                </div>
            </div>
        </div>
        <div style={styles.body}>
          {content}
        </div>
        <div style={styles.actions}>
            {onReply && (
                <span style={styles.actionText} onClick={onReply}>回复</span>
            )}
        </div>
        {children && (
            <div style={styles.nestedContainer}>
                {children}
            </div>
        )}
      </div>
    </div>
  );
};
