import { Steps } from 'components/Antd';
import { Formik } from 'formik';
import usePage from 'hooks/usePage';
import { useMemo, useState } from 'react';
import cx from 'classnames';
import { LeftCircleIcon } from 'resources/icons';
import * as yup from 'yup';
import { FormValues } from './types';
import styles from './RestoreWallet.module.scss';
import SeedWordsForm from './components/SeedWordsForm';
import CreatePassword from './components/CreatePassword';
import { DerivationPathMenuItem, storeMnemonicAndSeed, toDerivationPath } from 'utils/wallet-seed';

const RestoreWalletSchema = yup.object({
  parsedMnemonic: yup.string().required(),
  seed: yup.string().required(),
  password: yup.string().min(8, 'at least 8 characters').required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const RestoreWallet: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [, setPage] = usePage();

  const createInitialMneomicFields = () =>
    Array.from(Array(12).keys()).reduce((obj, value) => ({ ...obj, [value + 1]: '' }), {});

  const initialValues: FormValues = useMemo(
    () => ({
      mnemonic: createInitialMneomicFields(),
      parsedMnemonic: undefined,
      seed: undefined,
      password: '',
      confirmPassword: '',
      dPathMenuItem: DerivationPathMenuItem.Bip44Change
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

  const handleRestoreAccount = async (values: FormValues) => {
    const { parsedMnemonic, seed, password, dPathMenuItem } = values;
    try {
      if (parsedMnemonic && seed) {
        await storeMnemonicAndSeed(
          parsedMnemonic,
          seed,
          password,
          toDerivationPath(dPathMenuItem) || ''
        );
      }
    } catch (error) {
      console.log('restore account error: ', error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={RestoreWalletSchema}
      onSubmit={handleRestoreAccount}>
      <div className="flex flex-col">
        <div className="flex py-4 px-6 border-b-2 border-grey-100 items-center justify-between">
          <div className="cursor-pointer" onClick={onGoBackward}>
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
        </div>
        <div className="pt-6 px-6">{steps[current].content}</div>
      </div>
    </Formik>
  );
};

export default RestoreWallet;
