import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyIcon } from 'resources/icons';
import { useUnlockedMnemonicAndSeed } from 'utils/wallet-seed';
import * as yup from 'yup';

interface TFormProps {
  walletName: string;
  privateKey: string;
}

interface TProps {
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const WalletDetailSchema = yup.object({
  walletName: yup.string().required(),
  privateKey: yup.string().required()
});

const WalletDetail: React.FC<TProps> = ({ onSuccess }) => {
  const { updateAccountInfo, activeWallet, aptosWalletAccounts } = useAptosWallet();
  const { mnemonic } = useUnlockedMnemonicAndSeed();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const [copied, setCopied] = useState(false);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const currentWalletName = useMemo(() => {
    return aptosWalletAccounts.find((account) => account.address === activeWallet?.address)
      ?.walletName;
  }, [aptosWalletAccounts, activeWallet]);
  const handleOnClickCopy = (isMnemonic?: boolean) => {
    if (isMnemonic) {
      setMnemonicCopied(true);
    } else {
      setCopied(true);
    }
    setTimeout(() => {
      if (isMnemonic) {
        setMnemonicCopied(() => false);
      } else {
        setCopied(() => false);
      }
    }, 2000);
  };

  const onSubmit = async (values: TFormProps) => {
    try {
      const { walletName } = values;
      if (!activeWallet) throw new Error('Please re-authenticate');
      updateAccountInfo(activeWallet.address || '', walletName);
      onSuccess();
    } catch (error) {
      console.log('update wallet password error:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      walletName: currentWalletName || '',
      privateKey: privateKeyObject?.privateKeyHex || ''
    },
    validationSchema: WalletDetailSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col w-full gap-6" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col">
        <h5 className="text-grey-100 font-bold">Wallet Management</h5>
      </div>
      <div className="flex flex-col text-center gap-2 w-full">
        <Form.Item
          {...formItemLayout}
          className="w-full"
          label="Wallet Name"
          validateStatus={formik.errors.walletName ? 'error' : ''}
          help={formik.errors.walletName}>
          <TextInput
            name="walletName"
            placeholder="New WalletName"
            value={formik.values.walletName}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <Form.Item {...formItemLayout} className="w-full" label="Private Key">
          <TextInput
            readOnly
            value={copied ? 'Copied' : formik.values.privateKey}
            suffix={
              <CopyToClipboard
                text={privateKeyObject?.privateKeyHex || ''}
                onCopy={() => handleOnClickCopy()}>
                <CopyIcon />
              </CopyToClipboard>
            }
          />
        </Form.Item>
        <Form.Item {...formItemLayout} className="w-full" label="Mnemonic">
          <TextInput
            readOnly
            value={mnemonicCopied ? 'Copied' : mnemonic.mnemonic || ''}
            suffix={
              <CopyToClipboard
                text={mnemonic.mnemonic || ''}
                onCopy={() => handleOnClickCopy(true)}>
                <CopyIcon />
              </CopyToClipboard>
            }
          />
        </Form.Item>
        <div className="flex w-full justify-between mt-24 gap-4">
          <Button variant="outlined" className="w-full font-bold" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="w-full font-bold" disabled={!formik.dirty}>
            Update
          </Button>
        </div>
      </div>
    </form>
  );
};

export default WalletDetail;
