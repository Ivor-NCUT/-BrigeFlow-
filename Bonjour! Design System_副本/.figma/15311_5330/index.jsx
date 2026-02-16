import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.component}>
      <div className={styles.header}>
        <div className={styles.statusBar}>
          <div className={styles.time2}>
            <p className={styles.time}>9:41</p>
          </div>
          <div className={styles.levels}>
            <img
              src="../image/mloiltr9-3vc0hk8.svg"
              className={styles.cellularConnection}
            />
            <img src="../image/mloiltr9-t27k0n4.svg" className={styles.wifi} />
            <img src="../image/mloiltr9-9t2ent3.svg" className={styles.frame} />
          </div>
        </div>
        <div className={styles.title}>
          <div className={styles.returnButton}>
            <img
              src="../image/mloiltr9-r76fk4h.svg"
              className={styles.liChevronLeft}
            />
          </div>
          <div className={styles.returnButton2}>
            <img
              src="../image/mloiltr9-6ajri09.svg"
              className={styles.liChevronLeft}
            />
          </div>
          <img
            src="../image/mloiltr9-dapoyxt.svg"
            className={styles.wechatsystemDefault3}
          />
        </div>
      </div>
      <div className={styles.instance}>
        <div className={styles.content2}>
          <div className={styles.bio2}>
            <div className={styles.name2}>
              <p className={styles.text}>吴元培 Richard</p>
              <div className={styles.frame3}>
                <img
                  src="../image/mloiltr9-askd0jd.svg"
                  className={styles.frame2}
                />
                <div className={styles.vector8} />
                <div className={styles.logoName}>
                  <div className={styles.logo}>
                    <img
                      src="../image/mloiltr9-6q6dlkl.svg"
                      className={styles.layer1}
                    />
                  </div>
                  <p className={styles.name}>S25 校友</p>
                </div>
              </div>
            </div>
            <p className={styles.bio}>
              👋🏻 全干COO @Bonjour！
              <br />
              🎓 北邮AI硕（休学中｜中传数媒本
              <br />
              💼 ex 奇绩AI创产组负责人
              <br />
              💫 科技即是艺术
            </p>
          </div>
          <img src="../image/mloiltr9-97rdbpg.svg" className={styles.divider} />
          <div className={styles.content}>
            <p className={styles.text2}>
              Join Us! 急招对AI社交/社区感兴趣的社区运营（文科生友好！！！
              <br /> <br />
              我们在做一个面向创造者的社交平台，目前已经有14w+ 用户，大部分是来自AI/
              科技领域的从业者、爱好者
              <br /> <br />
              我们有三个产品：
              <br />
              1. 备受年轻人喜爱的个人说明书
              <br />
              2. AI/ 科技浓度超高的互动社区
              <br />
              3. 通过AI 技术帮助真实的人与人链接
              <br />
              总结来说，就是一个产品 @Bonjour！数字名片
              <br />
              （哈哈来自乔布斯的老梗）
              <br /> <br />
              期待与你一起交流
              <br />- 你对创造者/ GenZ 年轻人的洞察
              <br />- 你深度参与过/ 组建的社区
              <br />- 最近在看的电影/ 小说/ 播客…（Anything）
            </p>
            <div className={styles.frame4}>
              <div className={styles.autoWrapper}>
                <img src="../image/mloiltrc-nbqfrzp.png" className={styles.image} />
                <img
                  src="../image/mloiltrc-4oq9syo.png"
                  className={styles.image2}
                />
              </div>
              <div className={styles.autoWrapper2}>
                <img src="../image/mloiltrc-1g9t4xj.png" className={styles.image} />
                <img
                  src="../image/mloiltrc-dr5i1pg.png"
                  className={styles.image2}
                />
              </div>
              <div className={styles.autoWrapper2}>
                <img src="../image/mloiltrc-vyo16pa.png" className={styles.image} />
                <img
                  src="../image/mloiltrc-u1iky3h.png"
                  className={styles.image2}
                />
              </div>
            </div>
            <div className={styles.frame3056}>
              <img src="../image/mloiltrc-q5pbg4o.png" className={styles.image3} />
              <div className={styles.info2}>
                <p className={styles.title2}>Bonjour-1.23.512版本</p>
                <p className={styles.info}>
                  你以为今天是最糟的一天么，明天会让你改变这个看法的。
                </p>
              </div>
            </div>
            <div className={styles.tag2}>
              <img src="../image/mloiltr9-d7ndxa6.svg" className={styles.hash} />
              <p className={styles.tag}>🎮 Hackathon组队</p>
            </div>
          </div>
          <div className={styles.avatar}>
            <img src="../image/mloiltrc-ifajm9p.png" className={styles.image4} />
          </div>
        </div>
        <img src="../image/mloiltr9-zss9n4f.svg" className={styles.logo2} />
        <div className={styles.brand}>
          <img src="../image/mloiltr9-ic9t5x8.svg" className={styles.content3} />
          <div className={styles.frame5}>
            <img src="../image/mloiltr9-bu63kny.svg" className={styles.qRCode} />
          </div>
        </div>
        <div className={styles.buttons}>
          <div className={styles.button}>
            <img
              src="../image/mloiltr9-ic883x2.svg"
              className={styles.leadingIcon}
            />
            <p className={styles.text3}>分享到微信</p>
          </div>
          <div className={styles.button}>
            <img
              src="../image/mloiltr9-hs3s5e6.svg"
              className={styles.leadingIcon}
            />
            <p className={styles.text3}>保存图片</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
