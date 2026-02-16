import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.component}>
      <div className={styles.content}>
        <div className={styles.cover2}>
          <div className={styles.cover} />
        </div>
        <div className={styles.body}>
          <p className={styles.text}>WaytoAGI 全球黑客松 2025</p>
          <div className={styles.frame7620}>
            <div className={styles.time}>
              <div className={styles.date}>
                <p className={styles.text2}>10月22日</p>
                <div className={styles.frame1171275954}>
                  <p className={styles.text3}>周三</p>
                  <p className={styles.text3}>10:00</p>
                </div>
              </div>
              <img
                src="../image/mloilryy-j3g1ekf.svg"
                className={styles.frame1171275956}
              />
              <div className={styles.date2}>
                <p className={styles.text2}>10月23日</p>
                <div className={styles.frame1171275955}>
                  <p className={styles.text3}>周四</p>
                  <p className={styles.text3}>18:30</p>
                </div>
              </div>
            </div>
            <div className={styles.frame7425}>
              <div className={styles.rectangle11936}>
                <div className={styles.card}>
                  <div className={styles.text4}>
                    <p className={styles.name}>湖畔创研中心</p>
                    <p className={styles.adress}>中国浙江省杭州市余杭区礼贤路9号</p>
                  </div>
                  <div className={styles.map}>
                    <img
                      src="../image/mloilryy-5d1xaja.svg"
                      className={styles.liMap}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.vector1} />
          <div className={styles.frame}>
            <p className={styles.text5}>活动信息</p>
            <p className={styles.text6}>
              MLX是一个专为Apple硅设计的机器学习数组框架，由Apple机器学习研究团队提供。
              <br />
              <br />
              MLX的一些关键特性包括：
              <br />
              熟悉的API：MLX拥有与NumPy紧密相连的Python
              API，同时也提供全面的C++、C和Swift API，完美镜像Python
              API。MLX还提供了更高级的包，如`mlx.nn`和`mlx.optimizers`，其API与PyTorch相似，简化了复杂模型的构建。
              <br />
              可组合的函数变换：MLX支持可组合的函数变换，便于自动微分、自动向量化和计算图优化。
              <br />
              惰性计算：MLX中的计算是惰性执行的，数组仅在需要时才会被实际化。
              <br />
              动态图构建：MLX中的计算图是动态构建的，改变函数参数的形状不会导致缓慢的编译，调试过程简单直观。
              <br />
              多设备支持：操作可以在任何支持的设备上运行（目前支持CPU和GPU）。
              <br />
              统一内存：MLX与其他框架的显著区别在于其统一内存模型。MLX中的数组存储在共享内存中，操作可以在任何支持的设备类型上执行，而无需传输数据。
              <br />
              <br />
              MLX是由机器学习研究人员为机器学习研究人员设计的。该框架旨在用户友好，同时高效地训练和部署模型。框架的设计本身也概念简单。我们希望使研究人员能够轻松扩展和改进MLX，以快速探索新思路。
              <br />
              MLX的设计灵感来自于NumPy、PyTorch、Jax和ArrayFire等框架。
            </p>
          </div>
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.statusBar}>
          <div className={styles.time3}>
            <p className={styles.time2}>9:41</p>
          </div>
          <div className={styles.levels}>
            <img
              src="../image/mloilryy-ngi9w19.svg"
              className={styles.cellularConnection}
            />
            <img src="../image/mloilryy-dcmsynm.svg" className={styles.wifi} />
            <img src="../image/mloilryy-06c92mm.svg" className={styles.frame2} />
          </div>
        </div>
        <div className={styles.title}>
          <div className={styles.left}>
            <div className={styles.returnButton}>
              <img
                src="../image/mloilryy-6ko65hn.svg"
                className={styles.liChevronLeft}
              />
            </div>
            <p className={styles.text7}>WaytoAGI 全球黑客松 2025</p>
            <div className={styles.returnButton2}>
              <img
                src="../image/mloilryy-96et1rr.svg"
                className={styles.liChevronLeft}
              />
            </div>
          </div>
          <img
            src="../image/mloilryy-h1off0s.svg"
            className={styles.wechatsystemDefault3}
          />
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.gradient}>
          <div className={styles.actionBar}>
            <div className={styles.button}>
              <img src="../image/mloilryy-ldeumkg.svg" className={styles.liMap} />
              <p className={styles.text8}>分享</p>
            </div>
            <div className={styles.button2}>
              <img src="../image/mloilryy-zp6nwqn.svg" className={styles.liMap} />
              <p className={styles.text9}>报名</p>
            </div>
          </div>
        </div>
        <div className={styles.homeIndicator2}>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}

export default Component;
