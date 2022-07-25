import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';
import PopupPage from 'pages/PopupPage';

const WebWallet: React.FC = () => {
  const { activeWallet, walletList } = useAptosWallet();
  if (walletList && !activeWallet) {
    return (
      <div className="flex w-full justify-center pt-12">
        <Spin
          className="mt-6"
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />}
        />
      </div>
    );
  } else if (!activeWallet) {
    return <GetStartScreens />;
  }

  if (window.opener) {
    return <PopupPage opener={window.opener} />;
  }

  return <ConnectedScreens />;
};

export default WebWallet;
