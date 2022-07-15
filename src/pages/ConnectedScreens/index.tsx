import { Drawer, Menu, MenuProps, Spin, Tabs } from 'components/Antd';
import { useState } from 'react';
import cx from 'classnames';
import CoinList from './CoinList';
import Faucet from './Faucet';
import Settings from './Settings';
import WalletOverview from './WalletOverview';
import styles from './ConnectedScreens.module.scss';
import { CloseIcon, CoinListIcon, FaucetIcon, SettingIcon, SwapTabIcon } from 'resources/icons';
import LogoIcon from 'components/LogoIcon';
import WalletList from './WalletList';
import AddNewWallet from './AddNewWallet';
import ImportWallet from './ImportWallet';
import Swap from '../Swap';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { LoadingOutlined } from '@ant-design/icons';

const items: MenuProps['items'] = [
  {
    key: 'coinList',
    icon: <CoinListIcon />
  },
  {
    key: 'swap',
    icon: <SwapTabIcon />
  },
  {
    key: 'faucet',
    icon: <FaucetIcon />
  },
  {
    key: 'settings',
    icon: <SettingIcon />
  }
];

const ConnectedScreens: React.FC = () => {
  const [current, setCurrent] = useState('coinList');
  const [visible, setVisible] = useState(false);
  const [addNew, setAddNew] = useState(false);
  const { activeWallet, deleteAccount } = useAptosWallet();
  const { isLoading } = useHippoClient();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  const getModalContent = () => {
    if (isLoading) {
      return (
        <Spin
          className="mt-6"
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />}
        />
      );
    }
    if (activeWallet?.isAccountRemoved) {
      return (
        <div className="flex justify-between">
          <small className="text-red-600">Account is removed in devent</small>
          <small
            className="underline text-red-600 cursor-pointer"
            onClick={async (e: React.MouseEvent<HTMLElement>) => {
              e.preventDefault();
              e.stopPropagation();
              await deleteAccount(activeWallet.address || '');
            }}>
            Delete
          </small>
        </div>
      );
    }
    switch (current) {
      case 'coinList':
        return <CoinList />;
      case 'swap':
        return <Swap />;
      case 'faucet':
        return <Faucet />;
      case 'settings':
        return <Settings />;
      default:
        return <CoinList />;
    }
  };

  return (
    <div id="page-index" className="flex flex-col no-scrollbar h-full relative !w-full">
      <WalletOverview onShowWalletList={showDrawer} />
      <div
        id="tab-container"
        className="flex flex-col gap-4 px-6 no-scrollbar h-full pb-[66px] relative !w-full">
        {getModalContent()}
      </div>
      <div className="absolute bottom-0 w-full border-t-2 border-grey-100 bg-primePurple-900">
        <Menu
          mode="horizontal"
          theme="dark"
          overflowedIndicator={null}
          className={styles.menu}
          onClick={onClick}
          selectedKeys={[current]}
          items={items}
        />
      </div>
      <Drawer
        title={
          <div className="flex w-full justify-between items-center">
            <LogoIcon className="w-12 h-12" />
            <CloseIcon onClick={onClose} className="cursor-pointer" />
          </div>
        }
        placement="left"
        closable={false}
        visible={visible}
        getContainer={false}
        style={{ position: 'absolute' }}>
        <WalletList onSelect={onClose} onAddNew={() => setAddNew(true)} />
      </Drawer>
      {addNew && (
        <div className="absolute inset-0 bg-secondary z-[9999] py-16 px-8 ">
          <div onClick={() => setAddNew(false)} className="absolute right-12 top-9 cursor-pointer">
            <CloseIcon />
          </div>
          <Tabs defaultActiveKey="1" className={cx(styles.tabs)}>
            <Tabs.TabPane tab="Add Wallet" key="1">
              <AddNewWallet onSuccess={() => setAddNew(false)} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Import Wallet" key="2">
              <ImportWallet onSuccess={() => setAddNew(false)} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ConnectedScreens;
