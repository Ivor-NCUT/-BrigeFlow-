import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.message}>
        <img src="../image/mloib9n9-uxfwzoc.svg" className={styles.bell02} />
        <p className={styles.text}>开启互动消息通知，及时获取好友动态</p>
        <img src="../image/mloib9n9-9aqtq6g.svg" className={styles.bell02} />
      </div>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <div className={styles.image} />
            <div className={styles.instance}>
              <div className={styles.frame2989}>
                <p className={styles.a}>👍</p>
              </div>
              <div className={styles.rectangle601} />
              <div className={styles.rectangle602} />
            </div>
          </div>
          <div className={styles.button}>
            <p className={styles.label}>夸夸了你</p>
          </div>
        </div>
        <div className={styles.info}>
          <p className={styles.name}>园长 · Brian</p>
          <p className={styles.bio}>
            Xmind 创始人
            <br />
            balabala
          </p>
        </div>
      </div>
      <div className={styles.badge}>
        <div className={styles.property1Default}>
          <p className={styles.a12}>12</p>
        </div>
        <div className={styles.property1Variant2}>
          <img src="../image/mloib9n9-sf3bksx.svg" className={styles.frame} />
        </div>
      </div>
      <div className={styles.componentSet}>
        <div className={styles.component}>
          <div className={styles.frame6916}>
            <div className={styles.avatar2} />
            <div className={styles.badge2}>
              <img src="../image/mloib9n9-mmkk813.svg" className={styles.frame} />
            </div>
          </div>
          <div className={styles.content}>
            <p className={styles.name2}>Text</p>
            <p className={styles.message2}>Text</p>
          </div>
          <img src="../image/mloib9n9-p8fk9gf.svg" className={styles.arrow} />
        </div>
        <div className={styles.component2}>
          <div className={styles.frame69162}>
            <div className={styles.avatar3}>
              <img
                src="../image/mloib9n9-utdi04g.svg"
                className={styles.magicHat}
              />
            </div>
            <div className={styles.badge3}>
              <p className={styles.a12}>12</p>
            </div>
          </div>
          <div className={styles.content}>
            <p className={styles.name2}>Text</p>
            <p className={styles.message2}>Text</p>
          </div>
          <img src="../image/mloib9n9-p8fk9gf.svg" className={styles.arrow} />
        </div>
      </div>
      <div className={styles.messageItem}>
        <div className={styles.avatar4} />
        <div className={styles.content2}>
          <div className={styles.titleDate}>
            <p className={styles.name3}>Text</p>
            <p className={styles.time}>16:15</p>
          </div>
          <p className={styles.message2}>Text</p>
        </div>
      </div>
    </div>
  );
}

export default Component;
