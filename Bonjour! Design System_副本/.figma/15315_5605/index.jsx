import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.component}>
      <div className={styles.topBar}>
        <div className={styles.statusBar}>
          <div className={styles.time2}>
            <p className={styles.time}>9:41</p>
          </div>
          <div className={styles.levels}>
            <img
              src="../image/mloilrze-x5hjf3y.svg"
              className={styles.cellularConnection}
            />
            <img src="../image/mloilrze-gs2vt92.svg" className={styles.wifi} />
            <img src="../image/mloilrze-axpq02v.svg" className={styles.frame} />
          </div>
        </div>
        <div className={styles.title}>
          <div className={styles.returnButton}>
            <img
              src="../image/mloilrze-rslqgj9.svg"
              className={styles.liChevronLeft}
            />
          </div>
          <div className={styles.returnButton2}>
            <img
              src="../image/mloilrze-97kj7h4.svg"
              className={styles.liChevronLeft}
            />
          </div>
          <img
            src="../image/mloilrze-ty4q14q.svg"
            className={styles.wechatsystemDefault3}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.frame7088}>
          <p className={styles.text}>💭 开启提醒</p>
          <p className={styles.text2}>Bonjour只会在必要时提醒你</p>
        </div>
        <div className={styles.frame2}>
          <div className={styles.qRCode}>
            <img src="../image/mloilrzi-kk2dtpc.png" className={styles.code} />
          </div>
          <p className={styles.text3}>👆 长按关注，开启提醒</p>
        </div>
        <div className={styles.cards}>
          <div className={styles.autoWrapper}>
            <div className={styles.card}>
              <img src="../image/mloilrzi-u98qf2d.png" className={styles.image} />
              <div className={styles.text4}>
                <p className={styles.name}>Steve</p>
                <p className={styles.message}>对你的想法感兴趣！约个咖啡吗！</p>
              </div>
              <img src="../image/mloilrze-3zjkwqj.png" className={styles.nOw} />
            </div>
          </div>
          <div className={styles.autoWrapper2}>
            <div className={styles.card2}>
              <div className={styles.avatar}>
                <img
                  src="../image/mloilrzi-itp2nce.png"
                  className={styles.image2}
                />
              </div>
              <div className={styles.text5}>
                <p className={styles.name2}>Vincent</p>
                <p className={styles.message2}>我们正在找 Co-Founder，感兴趣不！</p>
              </div>
              <img src="../image/mloilrze-vye723p.png" className={styles.nOw2} />
            </div>
          </div>
          <div className={styles.card3}>
            <div className={styles.autoWrapper3}>
              <img src="../image/mloilrzi-519vlyp.png" className={styles.avatar2} />
            </div>
            <div className={styles.text6}>
              <p className={styles.name3}>Le Corbusier</p>
              <p className={styles.message3}>要一起组队 Hackathon 吗！</p>
            </div>
            <img src="../image/mloilrze-l5kymg6.svg" className={styles.nOw3} />
          </div>
        </div>
      </div>
      <div className={styles.homeIndicator2}>
        <div className={styles.homeIndicator} />
      </div>
    </div>
  );
}

export default Component;
