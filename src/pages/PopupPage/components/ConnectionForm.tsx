import Button from 'components/Button';
import LogoIcon from 'components/LogoIcon';
import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo } from 'react';
import { isExtension, walletAddressEllipsis } from 'utils/utility';

interface TProps {
  origin: string;
  onApprove: (detail: any) => void;
  onReject: (error: any) => void;
}

const ConnectionForm: React.FC<TProps> = ({ origin, onApprove, onReject }) => {
  const { activeWallet } = useAptosWallet();

  const handleOnCancel = () => {
    onReject(new Error('Connection is rejected by user'));
  };

  const handleOnClick = () => {
    if (isExtension) {
      chrome.storage.local.get('connectedAddress', (result) => {
        // TODO better way to do this
        const connectedAddress = {
          ...(result.connectedAddress || {}),
          [origin]: {
            publicKey: activeWallet?.address
          }
        };
        chrome.storage.local.set({ connectedAddress });
        onApprove({ address: activeWallet?.address, id: 1 });
      });
    }
  };

  const renderConnectionDetail = useMemo(() => {
    return (
      <div className="bg-primary rounded-xl p-4 w-full">
        <div className="w-full flex justify-between">
          <div className="font-bold text-grey-900">Site Domain</div>
          <div className="font-bold text-grey-900">{origin}</div>
        </div>
        <div className="w-full flex justify-between">
          <div className="font-bold text-grey-900">Wallet Address</div>
          <div className="font-bold text-grey-900">
            {walletAddressEllipsis(activeWallet?.address || '')}
          </div>
        </div>
      </div>
    );
  }, [activeWallet, origin]);

  return (
    <div className="p-8">
      <div className="flex flex-col items-center gap-10">
        {/* <h5 className="font-bold text-grey-900">
          {request?.payload.type} ({walletAddressEllipsis(privateKeyObject?.address || '')})
        </h5> */}
        <div className="w-full flex flex-col items-center">
          <LogoIcon className="mt-8 w-[120px] h-[120px]" />
          <h4 className="font-bold text-grey-900 my-8">
            Allow this site to access your Hippo account?
          </h4>
          {renderConnectionDetail}
        </div>
        <div className="flex w-full justify-between gap-10">
          <Button variant="outlined" className="flex-grow font-bold" onClick={handleOnCancel}>
            <h6 className="text-inherit">Cancel</h6>
          </Button>
          <Button
            type="submit"
            className="flex-grow font-bold"
            onClick={handleOnClick}
            // isLoading={loading}
          >
            <h6 className="text-inherit">Confirm</h6>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionForm;
