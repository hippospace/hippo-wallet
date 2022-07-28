// import { LoadingOutlined } from '@ant-design/icons';
// import { Spin } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';
import PopupPage from 'pages/PopupPage';

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();
  const params = new URLSearchParams(window.location.search);
  const isPopUp = params.get('isPopUp');

  if (!activeWallet) {
    return <GetStartScreens />;
  }
  if (window.opener || isPopUp) {
    return <PopupPage opener={window.opener} />;
  }

  return <ConnectedScreens />;
};

export default WebWallet;
