import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { loadingStoredData } from 'utils/wallet-seed';

const DefaultRoute: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isPopUp = params.get('isPopUp');
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

  if (isPopUp) {
    return <Navigate to={`/popup?${params.toString()}`} replace />;
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
  return <Navigate to="/getStart" replace />;
};

export default DefaultRoute;
