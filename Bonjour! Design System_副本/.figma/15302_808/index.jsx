import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.tag}>
        <div className={styles.selectedFalseLeading}>
          <p className={styles.a}>☕️</p>
          <p className={styles.text}>Text</p>
        </div>
        <div className={styles.selectedFalseLeading2}>
          <p className={styles.text}>Text</p>
        </div>
        <div className={styles.selectedFalseLeading3}>
          <p className={styles.text}>Text</p>
          <img
            src="../image/mloi9903-kv67dyo.svg"
            className={styles.frame1171275910}
          />
        </div>
        <div className={styles.selectedTrueLeadingI}>
          <img
            src="../image/mloi9903-h17ppae.svg"
            className={styles.frame1171275909}
          />
          <p className={styles.text2}>Text</p>
        </div>
        <div className={styles.selectedTrueLeadingI2}>
          <p className={styles.text2}>Text</p>
        </div>
        <div className={styles.selectedTrueLeadingI3}>
          <p className={styles.text2}>Text</p>
          <img
            src="../image/mloi9903-evbcvc2.svg"
            className={styles.frame1171275910}
          />
        </div>
      </div>
      <div className={styles.componentSet}>
        <div className={styles.stateEnabled}>
          <p className={styles.a2}>⚙️</p>
          <p className={styles.text}>Text</p>
        </div>
        <div className={styles.stateAction}>
          <div className={styles.tint}>
            <div className={styles.badge}>
              <p className={styles.a3}>3</p>
            </div>
            <p className={styles.text3}>Text</p>
          </div>
        </div>
        <div className={styles.stateHasSelectedChil}>
          <div className={styles.badge2}>
            <p className={styles.a32}>3</p>
          </div>
          <p className={styles.text2}>Text</p>
        </div>
        <div className={styles.stateState4}>
          <div className={styles.tint2}>
            <div className={styles.badge3}>
              <p className={styles.a32}>3</p>
            </div>
            <p className={styles.text4}>Text</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
