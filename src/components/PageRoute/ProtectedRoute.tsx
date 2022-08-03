import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState, useEffect } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { loadingStoredData } from 'utils/wallet-seed';

interface TProps {
  checkPopup?: boolean;
}

const ProtectedRoute: React.FC<TProps> = ({ checkPopup = false }) => {
  const [loading, setLoading] = useState(true);
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
    if (loading && activeWallet) {
      setLoading(false);
    }
  }, [activeWallet, loading]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isPopUp = params.get('isPopUp');

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
  if (checkPopup && isPopUp) {
    return <Navigate to={`/popup?${params.toString()}`} replace />;
  }
  if (!activeWallet) {
    return <Navigate to="/getStart" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
