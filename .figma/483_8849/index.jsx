import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.materialsLight}>
      <div className={styles.wallpaper}>
        <div className={styles.autoWrapper}>
          <p className={styles.ultraThick}>UltraThick</p>
          <div className={styles.ultraThick2} />
        </div>
        <div className={styles.autoWrapper2}>
          <p className={styles.ultraThick}>Thick</p>
          <div className={styles.thick} />
        </div>
        <div className={styles.autoWrapper3}>
          <p className={styles.ultraThick}>Medium</p>
          <div className={styles.medium} />
        </div>
        <div className={styles.autoWrapper4}>
          <p className={styles.ultraThick}>Thin</p>
          <div className={styles.thin} />
        </div>
        <div className={styles.autoWrapper5}>
          <p className={styles.ultraThick}>UltraThin</p>
          <div className={styles.ultraThin} />
        </div>
      </div>
    </div>
  );
}

export default Component;
