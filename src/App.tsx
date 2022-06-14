import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';
import PopupPage from 'pages/PopupPage';

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();

  if (!activeWallet) {
    return <GetStartScreens />;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const request = urlParams.get('request');
  if (request) {
    return <PopupPage opener={window.parent} initialRequest={JSON.parse(request)} />;
  }

  return <ConnectedScreens />;
};

export default WebWallet;
