import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.actionSheetItemAlert}>
        <div className={styles.stateEnabledAlertTru}>
          <img src="../image/mloi990j-icl52v1.svg" className={styles.icon} />
          <p className={styles.label}>text</p>
        </div>
        <div className={styles.stateDisabledAlertTr}>
          <img src="../image/mloi990j-icl52v1.svg" className={styles.icon} />
          <p className={styles.label}>text</p>
        </div>
        <div className={styles.stateEnabledAlertFal}>
          <img src="../image/mloi990j-puciwm4.svg" className={styles.icon} />
          <p className={styles.label2}>text</p>
        </div>
        <div className={styles.stateDisabledAlertFa}>
          <img src="../image/mloi990j-5zidcbr.svg" className={styles.icon} />
          <p className={styles.label2}>text</p>
        </div>
      </div>
      <div className={styles.cityItem}>
        <p className={styles.text}>阿坝</p>
      </div>
      <div className={styles.menuItem}>
        <img src="../image/mloi990j-j71qf3n.svg" className={styles.icon2} />
        <p className={styles.label3}>文本</p>
      </div>
      <div className={styles.menu}>
        <div className={styles.menuItem2}>
          <img src="../image/mloi990j-j71qf3n.svg" className={styles.icon2} />
          <p className={styles.label3}>文本</p>
        </div>
        <div className={styles.menuItem2}>
          <img src="../image/mloi990j-wmadtqe.svg" className={styles.icon2} />
          <p className={styles.label3}>文本</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
