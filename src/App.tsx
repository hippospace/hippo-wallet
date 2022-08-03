import DefaultRoute from 'components/PageRoute/DefaultRoute';
import PopupRoute from 'components/PageRoute/PopupRoute';
import ProtectedRoute from 'components/PageRoute/ProtectedRoute';
import PublicRoute from 'components/PageRoute/PublicRoute';
import ConnectedScreens from 'pages/ConnectedScreens';
import CoinList from 'pages/ConnectedScreens/CoinList';
import Faucet from 'pages/ConnectedScreens/Faucet';
import Settings from 'pages/ConnectedScreens/Settings';
import Swap from 'pages/ConnectedScreens/Swap';
import GetStartScreens from 'pages/GetStartScreens';
import CreateWallet from 'pages/GetStartScreens/CreateWallet';
import RestoreWallet from 'pages/GetStartScreens/RestoreWallet';
import WalletLogin from 'pages/GetStartScreens/WalletLogin';
import PopupPage from 'pages/PopupPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const WebWallet: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="walletLogin" element={<WalletLogin />} />
        <Route path="getStart" element={<PublicRoute />}>
          <Route index element={<GetStartScreens />} />
          <Route path="createWallet" element={<CreateWallet />} />
          <Route path="restoreWallet" element={<RestoreWallet />} />
        </Route>
        <Route path="/" element={<ProtectedRoute checkPopup />}>
          <Route index element={<Navigate to="/coinList" replace />} />
          <Route element={<ConnectedScreens />}>
            <Route path="coinList" element={<CoinList />} />
            <Route path="swap" element={<Swap />} />
            <Route path="faucet" element={<Faucet />} />
            <Route path="settings">
              <Route path=":action" element={<Settings />} />
              <Route index element={<Settings />} />
            </Route>
          </Route>
        </Route>
        <Route path="popup" element={<PopupRoute />}>
          <Route index element={<PopupPage opener={window.opener} />} />
        </Route>
        <Route path="*" element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  );
};

export default WebWallet;
