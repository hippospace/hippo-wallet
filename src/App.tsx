/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import { LoadingOutlined } from '@ant-design/icons';
// import { Spin } from 'components/Antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import ConnectedScreens from 'pages/ConnectedScreens';
import GetStartScreens from 'pages/GetStartScreens';
import CreateWallet from 'pages/GetStartScreens/CreateWallet';
import RestoreWallet from 'pages/GetStartScreens/RestoreWallet';
import WalletLogin from 'pages/GetStartScreens/WalletLogin';
import PopupPage from 'pages/PopupPage';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useHasLockedMnemonicAndSeed } from 'utils/wallet-seed';

const ProtectedRoute: React.FC = () => {
  const { activeWallet } = useAptosWallet();
  // const location = useLocation();
  // const params = new URLSearchParams(location.search);
  // const isPopUp = params.get('isPopUp');
  if (!activeWallet) {
    return <Navigate to="/getStart" replace />;
  }
  return <Outlet />;
};

const PublicRoute: React.FC = () => {
  const [hasLockedMnemonicAndSeed, loading] = useHasLockedMnemonicAndSeed();

  if (loading) {
    return (
      <div className="flex w-full justify-center pt-12">
        <Spin
          className="mt-6"
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />}
        />
      </div>
    );
  }

  if (hasLockedMnemonicAndSeed) {
    return <Navigate to="/walletLogin" replace />;
    // return <WalletLogin onRecoverPassword={() => setPage('restoreWallet')} />;
  }
  return <Outlet />;
};

const WebWallet: React.FC = () => {
  // const { activeWallet } = useAptosWallet();
  // const params = new URLSearchParams(window.location.search);
  // const isPopUp = params.get('isPopUp');

  // if (!activeWallet) {
  //   return <GetStartScreens />;
  // }
  // if (window.opener || isPopUp) {
  //   return <PopupPage opener={window.opener} />;
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="walletLogin" element={<WalletLogin />} />
        <Route path="getStart">
          <Route index element={<GetStartScreens />} />
          <Route path="createWallet" element={<CreateWallet />} />
          <Route path="restoreWallet" element={<RestoreWallet />} />
        </Route>
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<ConnectedScreens />} />
          {/* <Route path="teams" element={<Teams />}>
            <Route path=":teamId" element={<Team />} />
            <Route path="new" element={<NewTeamForm />} />
            <Route index element={<LeagueStandings />} />
          </Route> */}
        </Route>
        <Route path="popup" element={<ProtectedRoute />}>
          <Route index element={<PopupPage opener={window.opener} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );

  // return <ConnectedScreens />;
};

export default WebWallet;
