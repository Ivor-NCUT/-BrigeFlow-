import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.tab2}>
      <div className={styles.tabButton}>
        <div className={styles.selectedTrue}>
          <p className={styles.text}>文本</p>
          <div className={styles.tag} />
        </div>
        <p className={styles.text2}>文本</p>
      </div>
      <div className={styles.tab}>
        <div className={styles.tabButton2}>
          <p className={styles.text}>文本</p>
          <div className={styles.tag2} />
        </div>
        <p className={styles.text3}>文本</p>
        <p className={styles.text3}>文本</p>
      </div>
      <div className={styles.image}>
        <div className={styles.stateLoaded} />
        <div className={styles.stateError} />
        <div className={styles.stateError} />
      </div>
      <div className={styles.avatar}>
        <div className={styles.stateImageSize40}>
          <div className={styles.image2} />
        </div>
        <div className={styles.stateImageSize36}>
          <div className={styles.image2} />
        </div>
        <div className={styles.stateImageSize32}>
          <div className={styles.image2} />
        </div>
        <div className={styles.stateImageSize24}>
          <div className={styles.image2} />
        </div>
        <div className={styles.stateDefaultSize40}>
          <div className={styles.ellipse9} />
          <div className={styles.ellipse10} />
        </div>
        <div className={styles.stateDefaultSize36}>
          <div className={styles.ellipse92} />
          <div className={styles.ellipse102} />
        </div>
        <div className={styles.stateDefaultSize32}>
          <div className={styles.ellipse93} />
          <div className={styles.ellipse103} />
        </div>
        <div className={styles.stateDefaultSize24}>
          <div className={styles.ellipse94} />
          <div className={styles.ellipse104} />
        </div>
      </div>
    </div>
  );
}

export default Component;
