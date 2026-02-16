import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.section}>
      <div className={styles.inputAreaAi}>
        <div className={styles.focusedFalse}>
          <p className={styles.text}>想认识有过 xx 经历的增长 / 运营</p>
        </div>
        <div className={styles.focusedTrue}>
          <p className={styles.text}>想认识有过 xx 经历的增长 / 运营</p>
          <div className={styles.rectangle12026} />
        </div>
      </div>
      <div className={styles.inputBar}>
        <div className={styles.action}>
          <div className={styles.input}>
            <img src="../image/mloi9909-scw6izx.svg" className={styles.icon} />
            <p className={styles.placeholder}>回复 Harlar...</p>
          </div>
          <p className={styles.text2}>发送</p>
        </div>
        <div className={styles.action2}>
          <div className={styles.input2}>
            <img src="../image/mloi9909-scw6izx.svg" className={styles.icon} />
            <p className={styles.placeholder}>回复 Harlar...</p>
          </div>
          <div className={styles.button}>
            <p className={styles.text3}>发送</p>
          </div>
        </div>
        <div className={styles.action3}>
          <div className={styles.input3}>
            <p className={styles.placeholder2}>我想做一款</p>
          </div>
          <p className={styles.text2}>发送</p>
        </div>
        <div className={styles.action4}>
          <div className={styles.input4}>
            <p className={styles.placeholder3}>
              我想做一款 MacOS 的本地字体管理工具，名字叫做TypeShop，想找一位 iOS
              开发者长期合作，感兴趣的朋友可将简历发送至：
              <br />
              harlan_xu@qq.com
            </p>
          </div>
          <p className={styles.text2}>发送</p>
        </div>
      </div>
      <div className={styles.inputArea}>
        <div className={styles.focusedFalse2}>
          <p className={styles.text4}>
            你是谁，在做什么令你满足的作品，在关注什么？
          </p>
        </div>
        <div className={styles.focusedTrue2}>
          <p className={styles.text4}>
            你是谁，在做什么令你满足的作品，在关注什么？
          </p>
          <div className={styles.rectangle12048} />
        </div>
      </div>
    </div>
  );
}

export default Component;
