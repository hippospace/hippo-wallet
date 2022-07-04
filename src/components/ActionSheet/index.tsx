import { Drawer } from 'antd';
import classNames from 'classnames';
import Button from 'components/Button';
import { CSSProperties, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import styles from './index.module.scss';

export interface ActionSheetProps {
  className?: string;
  children: ReactNode;
  visible?: boolean;
  title?: string | ReactNode;
  footer?: ReactNode;
  mode: 'fullTab' | 'fullScreen' | 'auto';
  destroyOnClose?: boolean;
  contentWrapperStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  onClose?: () => void;
}

const ActionSheet: FC<ActionSheetProps> = ({
  className,
  children,
  visible = false,
  title,
  footer,
  contentWrapperStyle,
  headerStyle,
  bodyStyle,
  footerStyle,
  mode = 'fullTab',
  destroyOnClose = false,
  onClose = () => {}
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const onCloseCb = useCallback(() => {
    setIsVisible(false);
    onClose();
  }, [onClose]);

  let containerSelector: false | string = false;
  let height = 'default';
  if (mode === 'fullTab') {
    containerSelector = '#tab-container';
    height = '100%';
  } else if (mode === 'fullScreen') {
    containerSelector = '#page-index';
    height = '100%';
  } else if (mode === 'auto') {
    containerSelector = '#page-index';
    height = 'auto';
  }

  return (
    <Drawer
      className={classNames(className, styles.actionSheet)}
      visible={isVisible}
      placement={'bottom'}
      closable={false}
      getContainer={containerSelector}
      style={{ position: 'absolute' }}
      height={height}
      title={title}
      width={'100%'}
      drawerStyle={contentWrapperStyle}
      headerStyle={headerStyle}
      bodyStyle={bodyStyle}
      footerStyle={footerStyle}
      destroyOnClose={destroyOnClose}
      footer={
        footer ?? (
          <Button className="w-full !border-none" onClick={onCloseCb}>
            Close
          </Button>
        )
      }
      onClose={onCloseCb}>
      {children}
    </Drawer>
  );
};

export default ActionSheet;
