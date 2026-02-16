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
              src="../image/mloilrmr-n8drfxb.svg"
              className={styles.cellularConnection}
            />
            <img src="../image/mloilrmr-t255qvn.svg" className={styles.wifi} />
            <img src="../image/mloilrmr-6c4d4f4.svg" className={styles.frame} />
          </div>
        </div>
        <div className={styles.title}>
          <div className={styles.autoWrapper}>
            <p className={styles.text}>消息</p>
            <div className={styles.returnButton}>
              <img
                src="../image/mloilrmr-ucbc19g.svg"
                className={styles.liBadgeInfo}
              />
            </div>
          </div>
          <img
            src="../image/mloilrmr-sn0ld6u.svg"
            className={styles.wechatsystemDefault3}
          />
        </div>
      </div>
      <div className={styles.content4}>
        <div className={styles.top}>
          <div className={styles.tip}>
            <div className={styles.message}>
              <img src="../image/mloilrmr-bong1gm.svg" className={styles.bell02} />
              <p className={styles.text2}>开启互动消息通知，及时获取好友动态</p>
              <img src="../image/mloilrmr-qtb2n41.svg" className={styles.bell02} />
            </div>
          </div>
          <div className={styles.messageList}>
            <div className={styles.instance}>
              <div className={styles.frame6916}>
                <div className={styles.avatar}>
                  <img
                    src="../image/mloilrmr-60vwoum.svg"
                    className={styles.magicHat}
                  />
                </div>
                <div className={styles.badge}>
                  <p className={styles.a12}>12</p>
                </div>
              </div>
              <div className={styles.content}>
                <p className={styles.name}>点赞/回复/夸夸</p>
                <p className={styles.message2}>🤝 张山山申请添加你为好友！</p>
              </div>
              <img src="../image/mloilrmr-og7e2gx.svg" className={styles.arrow} />
            </div>
            <div className={styles.instance2}>
              <div className={styles.frame69162}>
                <div className={styles.avatar2} />
                <div className={styles.badge2}>
                  <img
                    src="../image/mloilrmr-bejqwyf.svg"
                    className={styles.frame2}
                  />
                </div>
              </div>
              <div className={styles.content}>
                <p className={styles.name}>新朋友</p>
                <p className={styles.message2}>🤝 张山山关注了你</p>
              </div>
              <img src="../image/mloilrmr-og7e2gx.svg" className={styles.arrow} />
            </div>
          </div>
        </div>
        <div className={styles.top2}>
          <div className={styles.messageItem}>
            <div className={styles.avatar3} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>Bonnie</p>
                <p className={styles.time3}>刚刚</p>
              </div>
              <p className={styles.message2}>
                找到了几个能和你组长期固定队打黑客松的朋友
              </p>
            </div>
          </div>
          <div className={styles.messageItem2}>
            <div className={styles.avatar4} />
            <div className={styles.content3}>
              <div className={styles.titleDate2}>
                <div className={styles.title2}>
                  <p className={styles.name3}>IF 大会</p>
                  <p className={styles.name4}>#Founder Park</p>
                </div>
                <p className={styles.time3}>16:15</p>
              </div>
              <p className={styles.message2}>
                [50 条] Vincent: 有朋友约中饭聊聊上午的分享吗...
              </p>
            </div>
          </div>
          <div className={styles.messageItem3}>
            <div className={styles.avatar5} />
            <div className={styles.content3}>
              <div className={styles.titleDate2}>
                <div className={styles.title2}>
                  <p className={styles.name3}>AGI Playground 2025</p>
                  <p className={styles.name4}>#Founder Park</p>
                </div>
                <p className={styles.time3}>02:12</p>
              </div>
              <p className={styles.message2}>
                [60 条] 张山山: 欢迎以后继续持续关注 Founder...
              </p>
            </div>
          </div>
          <div className={styles.messageItem4}>
            <div className={styles.avatar6} />
            <div className={styles.content3}>
              <div className={styles.titleDate2}>
                <div className={styles.title2}>
                  <p className={styles.name3}>Fancy Agent</p>
                  <p className={styles.name4}>#Founder Park</p>
                </div>
                <p className={styles.time3}>昨天</p>
              </div>
              <p className={styles.message2}>
                [10 条] Ashley: 最近大家有看到什么 Fancy 的...
              </p>
            </div>
          </div>
          <div className={styles.messageItem5}>
            <div className={styles.avatar7} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>Vincent</p>
                <p className={styles.time3}>1周前</p>
              </div>
              <p className={styles.message2}>Hello 呀！！很高兴认识</p>
            </div>
          </div>
          <div className={styles.messageItem6}>
            <div className={styles.avatar8} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>🦄 车库招募中</p>
                <p className={styles.time3}>2026-01-10</p>
              </div>
              <p className={styles.message2}>
                [推荐上新] Dify: 我们正在招募高级产品设计师...
              </p>
            </div>
          </div>
          <div className={styles.messageItem7}>
            <div className={styles.avatar9} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>Hackathon 匹配区</p>
                <p className={styles.time3}>2026-01-09</p>
              </div>
              <p className={styles.message2}>
                [10 条] Ryan: 【AI Agent创新项目】【找队友】...
              </p>
            </div>
          </div>
          <div className={styles.messageItem8}>
            <div className={styles.avatar10} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>过滤的消息</p>
                <p className={styles.time3}>2026-01-02</p>
              </div>
              <p className={styles.message2}>Social Animal：你好</p>
            </div>
          </div>
          <div className={styles.messageItem8}>
            <div className={styles.avatar10} />
            <div className={styles.content2}>
              <div className={styles.titleDate}>
                <p className={styles.name2}>Text</p>
                <p className={styles.time3}>16:15</p>
              </div>
              <p className={styles.message2}>Text</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Component;
