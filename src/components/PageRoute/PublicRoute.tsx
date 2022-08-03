import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useHasLockedMnemonicAndSeed, loadingStoredData } from 'utils/wallet-seed';

const PublicRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasLockedMnemonicAndSeed] = useHasLockedMnemonicAndSeed();
  const { activeWallet } = useAptosWallet();
  const initialFetch = async () => {
    setLoading(true);
    const store = await loadingStoredData();
    if (!store) {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialFetch();
  }, []);

  useEffect(() => {
    if (loading && hasLockedMnemonicAndSeed) {
      setLoading(false);
    }
  }, [hasLockedMnemonicAndSeed, loading]);

  if (activeWallet) {
    return <Navigate to="/" replace />;
  }

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
  }
  return <Outlet />;
};

export default PublicRoute;
