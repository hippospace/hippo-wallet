import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';
import PopupPage from 'pages/PopupPage';

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();

  if (!activeWallet) {
    return <GetStartScreens />;
  }

  if (window.opener) {
    return <PopupPage opener={window.opener} />;
  }

  return <ConnectedScreens />;
};

export default WebWallet;
