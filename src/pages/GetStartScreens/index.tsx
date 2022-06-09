// import useAptosWallet from 'hooks/useAptosWallet';
// import { useState } from 'react';
import LogoIcon from 'components/LogoIcon';
// import CreateWallet from './CreateWallet';
// import WalletLogin from './WalletLogin';
import Button from 'components/Button';
import usePage from 'hooks/usePage';
import CreateWallet from 'pages/CreateWallet';

const GetStartScreens: React.FC = () => {
  // const { initialized } = useAptosWallet();
  const [page, setPage] = usePage();

  // if (screen === 'createWallet') {
  //   return <CreateWallet />;
  // } else if (screen === 'login') {
  //   return <WalletLogin onCreateNew={() => setScreen('createWallet')} />;
  // }
  if (page === 'createWallet') {
    return <CreateWallet />;
  }

  return (
    <div className="flex flex-col items-center px-2 py-10">
      <LogoIcon className="mt-8 w-[120px] h-[120px]" />
      <div className="mt-20 flex flex-col items-center text-center gap-4">
        <h4 className="text-grey-900 font-bold">Web Wallet at Hippo</h4>
        <div className="text-grey-900">
          To get started, create a new wallet or use one you already have.
        </div>
      </div>
      <div className="mt-[120px] flex flex-col items-center text-center gap-7 w-full px-4">
        <Button className="w-full font-bold" onClick={() => setPage('createWallet')}>
          Create a new wallet
        </Button>
        <Button
          variant="outlined"
          className="w-full font-bold"
          onClick={() => setPage('importWallet')}>
          I already have a wallet
        </Button>
      </div>
    </div>
  );
};

export default GetStartScreens;
