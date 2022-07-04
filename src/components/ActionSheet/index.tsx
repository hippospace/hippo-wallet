import { Drawer } from 'antd';
import Button from 'components/Button';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';

export interface ActionSheetProps {
  children: ReactNode;
  visible?: boolean;
  title?: string | ReactNode;
  footer?: ReactNode;
  mode: 'fullTab' | 'fullScreen' | 'auto';
  onClose?: () => void;
}

const ActionSheet: FC<ActionSheetProps> = ({
  children,
  visible = false,
  title,
  footer,
  mode = 'fullTab',
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
      visible={isVisible}
      placement={'bottom'}
      closable={false}
      getContainer={containerSelector}
      style={{ position: 'absolute' }}
      height={height}
      title={title}
      width={'100%'}
      footer={
        footer ?? (
          <Button className="w-full" onClick={onCloseCb}>
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
