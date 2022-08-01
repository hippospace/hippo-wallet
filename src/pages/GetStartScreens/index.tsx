/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import LogoIcon from 'components/LogoIcon';
import Button from 'components/Button';
import usePage from 'hooks/usePage';
import { useHasLockedMnemonicAndSeed } from 'utils/wallet-seed';
import CreateWallet from './CreateWallet';
import WalletLogin from './WalletLogin';
import RestoreWallet from './RestoreWallet';
import { Spin } from 'components/Antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const GetStartScreens: React.FC = () => {
  // const [page, setPage] = usePage();
  // const [hasLockedMnemonicAndSeed, loading] = useHasLockedMnemonicAndSeed();
  const navigate = useNavigate();

  // if (loading) {
  //   return (
  //     <div className="flex w-full justify-center pt-12">
  //       <Spin
  //         className="mt-6"
  //         indicator={<LoadingOutlined style={{ fontSize: 48, color: '#fff' }} spin />}
  //       />
  //     </div>
  //   );
  // }

  // if (page === 'restoreWallet') {
  //   return <RestoreWallet />;
  // }

  // if (hasLockedMnemonicAndSeed) {
  //   navigate('walletLogin');
  //   // return <WalletLogin onRecoverPassword={() => setPage('restoreWallet')} />;
  // }

  // if (page === 'createWallet') {
  //   return <CreateWallet />;
  // }

  return (
    <div className="flex flex-col items-center px-6 pt-10">
      <LogoIcon className="mt-8 w-[96px] h-[96px]" />
      <div className="mt-10 flex flex-col items-center text-center gap-4">
        <h4 className="text-grey-100 font-bold">Hippo Web Wallet</h4>
        <div className="text-grey-100">
          To get started, create a new wallet or use one you already have.
        </div>
      </div>
      <div className="flex flex-col items-center text-center gap-4 w-[328px] absolute bottom-4">
        <Button
          className="w-full font-bold"
          id="create-wallet"
          onClick={() => navigate('createWallet')}>
          Create wallet
        </Button>
        <Button
          variant="outlined"
          id="existing-wallet"
          className="w-full font-bold"
          onClick={() => navigate('restoreWallet')}>
          already have wallet
        </Button>
      </div>
    </div>
  );
};

export default GetStartScreens;
