import LogoIcon from 'components/LogoIcon';
import Button from 'components/Button';
import usePage from 'hooks/usePage';
import { useHasLockedMnemonicAndSeed } from 'utils/wallet-seed';
import CreateWallet from './CreateWallet';
import WalletLogin from './WalletLogin';
import RestoreWallet from './RestoreWallet';

const GetStartScreens: React.FC = () => {
  const [page, setPage] = usePage();
  const [hasLockedMnemonicAndSeed, loading] = useHasLockedMnemonicAndSeed();

  if (loading) {
    return null;
  }

  if (page === 'restoreWallet') {
    return <RestoreWallet />;
  }

  if (hasLockedMnemonicAndSeed) {
    return <WalletLogin onRecoverPassword={() => setPage('restoreWallet')} />;
  }

  if (page === 'createWallet') {
    return <CreateWallet />;
  }

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
        <Button className="w-full font-bold" onClick={() => setPage('createWallet')}>
          Create wallet
        </Button>
        <Button
          variant="outlined"
          className="w-full font-bold"
          onClick={() => setPage('restoreWallet')}>
          already have wallet
        </Button>
      </div>
    </div>
  );
};

export default GetStartScreens;
