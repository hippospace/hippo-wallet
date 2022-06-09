import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';

const WebWallet: React.FC = () => {
  const { activeWallet } = useAptosWallet();

  if (!activeWallet) {
    return <GetStartScreens />;
  }

  return <ConnectedScreens />;
};

export default WebWallet;
