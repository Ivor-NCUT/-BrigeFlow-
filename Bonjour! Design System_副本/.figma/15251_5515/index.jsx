import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.event}>
        <img src="../image/mloidiku-ogthr01.png" className={styles.image} />
        <div className={styles.frame1171275650}>
          <p className={styles.title}>WaytoAGI 全球黑客松</p>
          <div className={styles.content}>
            <div className={styles.frame}>
              <img
                src="../image/mloidiks-ovzi60j.svg"
                className={styles.liClock8}
              />
              <p className={styles.date}>2025.7.12 上午 10:00</p>
            </div>
            <div className={styles.frame2}>
              <img
                src="../image/mloidiks-wqwwse6.svg"
                className={styles.liClock8}
              />
              <p className={styles.date}>浙江 · 杭州</p>
            </div>
            <div className={styles.tag}>
              <p className={styles.eventDate}>待进行</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.shareImage}>
        <div className={styles.cover} />
        <p className={styles.text}>WaytoAGI 全球黑客松 2025</p>
        <p className={styles.text2}>10月22日（周三）~ 10月23日（周四）</p>
        <div className={styles.frame3}>
          <p className={styles.text3}>浙江</p>
          <div className={styles.ellipse1} />
          <p className={styles.text3}>杭州</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
