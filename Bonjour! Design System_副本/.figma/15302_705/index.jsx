import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.bottom}>
        <div className={styles.typeMain}>
          <div className={styles.bottomBar}>
            <div className={styles.container}>
              <div className={styles.bottomBarButton}>
                <img src="../image/mloib9qk-30ftwvd.svg" className={styles.me} />
              </div>
              <div className={styles.bottomBarButton}>
                <img src="../image/mloib9qk-uxxajyb.svg" className={styles.me} />
              </div>
              <div className={styles.bottomBarButton}>
                <img src="../image/mloib9qk-9wedefm.svg" className={styles.me} />
              </div>
              <div className={styles.bottomBarButton2}>
                <p className={styles.text}>消息</p>
              </div>
            </div>
            <div className={styles.container2}>
              <div className={styles.button}>
                <img src="../image/mloib9qk-ymupftz.svg" className={styles.me} />
              </div>
              <div className={styles.button}>
                <img src="../image/mloib9qk-rrfegfl.svg" className={styles.me} />
              </div>
            </div>
          </div>
          <div className={styles.homeIndicator2}>
            <div className={styles.homeIndicator} />
          </div>
        </div>
        <div className={styles.typeAction}>
          <div className={styles.gradient}>
            <div className={styles.frame}>
              <p className={styles.text2}>跳过</p>
              <div className={styles.button2}>
                <p className={styles.text3}>下一步</p>
              </div>
            </div>
            <div className={styles.homeIndicator3}>
              <div className={styles.homeIndicator} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
