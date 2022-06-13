import { Steps } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useState } from 'react';
import cx from 'classnames';
import * as yup from 'yup';
import { useMemo } from 'react';
import { Formik } from 'formik';
import { CloseIcon, LeftCircleIcon } from 'resources/icons';
import usePage from 'hooks/usePage';
import SeedWordsForm from './components/SeedWordsForm';
import styles from './CreateWallet.module.scss';
import { FormValues } from './types';
import WalletName from './components/WalletName';
import CreatePassword from './components/CreatePassword';
import { DERIVATION_PATH, storeMnemonicAndSeed } from 'utils/wallet-seed';

const CreateWalletSchema = yup.object({
  walletName: yup.string().required(),
  password: yup.string().min(8, 'at least 8 characters').required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  understood: yup.boolean().oneOf([true]).required(),
  agree: yup.boolean().oneOf([true]).required()
});

const CreateWallet: React.FC = () => {
  const { setWalletList } = useAptosWallet();
  const [, setPage] = usePage();
  const [current, setCurrent] = useState(0);

  const initialValues: FormValues = useMemo(
    () => ({
      mnemonicAndSeed: undefined,
      walletName: '',
      password: '',
      confirmPassword: '',
      copied: false,
      understood: false,
      agree: false
    }),
    []
  );

  const steps = useMemo(
    () => [
      {
        title: 'seedWord',
        content: <SeedWordsForm goForward={() => setCurrent(1)} />
      },
      {
        title: 'name',
        content: <WalletName goForward={() => setCurrent(2)} />
      },
      {
        title: 'password',
        content: <CreatePassword />
      }
    ],
    []
  );

  const onGoBackward = () => {
    if (current) {
      setCurrent((prevState) => prevState - 1);
    } else {
      setPage('');
    }
  };

  const handleCreateAccount = async (values: FormValues) => {
    const { mnemonicAndSeed, password, walletName } = values;
    if (mnemonicAndSeed) {
      const { mnemonic, seed } = mnemonicAndSeed;
      await setWalletList({ 0: { walletName: walletName } });
      await storeMnemonicAndSeed(mnemonic, seed, password, DERIVATION_PATH.bip44Change);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateWalletSchema}
      onSubmit={handleCreateAccount}>
      <div className="flex flex-col">
        <div className="flex py-4 px-6 border-b-2 border-grey-900 items-center justify-between">
          <div className="p-2 cursor-pointer" onClick={onGoBackward}>
            <LeftCircleIcon />
          </div>
          <Steps
            current={current}
            className={cx(styles.steps, 'justify-center')}
            direction="horizontal"
            progressDot={() => {
              return <div className="w-14 h-1 rounded-xl indicator"></div>;
            }}>
            {steps.map((item) => (
              <Steps.Step key={item.title} />
            ))}
          </Steps>
          <div className="p-2 cursor-pointer" onClick={() => setPage('')}>
            <CloseIcon className="cursor-pointer" />
          </div>
        </div>
        <div className="py-5 px-8">{steps[current].content}</div>
      </div>
    </Formik>
  );
};

export default CreateWallet;
