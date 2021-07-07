import { Icon, Tooltip, Tag, message } from 'antd';
import React, {useEffect, useState} from 'react';
import { connect } from 'dva';
// import { formatMessage } from 'umi-plugin-react/locale';
import { ConnectProps, ConnectState } from '@/models/connect';

import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
// import SelectLang from '../SelectLang';
import styles from './index.less';
import NoticeIconView from './NoticeIconView';
import encodeQueryParam from '@/utils/encodeParam';
import {router} from "umi";
import alarm_img from '../../../public/fengmap/images/alarm.gif';
import apis from "@/services";

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
}

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

interface State {
  alarmVisible: boolean;
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const { theme, layout, dispatch } = props;

  const initState: State = {
    alarmVisible: false,
  };
  const [alarmVisible, setAlarmVisible] = useState(initState.alarmVisible);

  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }
  const fetchData = () => {
    if (dispatch) {
      dispatch({
        type: 'global/fetchNotices',
        payload: encodeQueryParam({
          terms: { state: 'unread' }
        })
      });
    }
  }

  useEffect(() => {
    apis.deviceAlarm.findAlarmLogCount(encodeQueryParam({ terms: {state: "newer"} }))
      .then((response: any) => {
        if (response.status === 200 && response.result > 0) {
          setAlarmVisible(true);
        }
      }).catch(() => {
    });
  }, []);

  return (
    <div className={className}>
      {/* <HeaderSearch
        className={`${styles.action} ${styles.search}`}
        placeholder={formatMessage({
          id: 'component.globalHeader.search',
        })}
        defaultValue="umi ui"
        dataSource={[
          formatMessage({
            id: 'component.globalHeader.search.example1',
          }),
          formatMessage({
            id: 'component.globalHeader.search.example2',
          }),
          formatMessage({
            id: 'component.globalHeader.search.example3',
          }),
        ]}
        onSearch={() => { }}
        onPressEnter={() => { }}
      /> */}
      {/* <span className="header">车辆端安全管控支撑系统</span> */}
      {/* <Tooltip title="使用文档">
        <a
          target="_blank"
          href="http://doc.rwslinks.cn/"
          rel="noopener noreferrer"
          className={styles.action}
        >
          <Icon type="question-circle-o" />
        </a>
      </Tooltip> */}
      {
        alarmVisible && <img
          className={styles.action}
          style={{ height: '35px' }}
          src={alarm_img}
          onClick={() => {
            router.push({
              pathname: '/device/alarm',
            })
          }}
        >
        </img>
      }
      <span onClick={() => { fetchData() }}>
        <NoticeIconView />
      </span>
      <Avatar />
      {REACT_APP_ENV && <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>}
      {/* <SelectLang className={styles.action} /> */}
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
