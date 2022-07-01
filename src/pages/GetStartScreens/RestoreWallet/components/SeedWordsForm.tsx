import Button from 'components/Button';
import { useCallback, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { FormValues } from '../types';
import { mnemonicToSeed, normalizeMnemonic } from 'utils/wallet-seed';
import { message } from 'components/Antd';

interface TProps {
  goForward: () => void;
}

const SeedWordsForm: React.FC<TProps> = ({ goForward }) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const mnemonicInput = useMemo(() => {
    return Object.keys(values.mnemonic)
      .filter((key) => !!values.mnemonic[parseInt(key)])
      .map((key) => values.mnemonic[parseInt(key)]);
  }, [values.mnemonic]);

  const renderMnemonicList = useMemo(() => {
    return Object.keys(values.mnemonic).map((key) => (
      <div
        className="flex basis-[104px] border-2 border-grey-100 bg-grey-100 rounded-xl flex-grow"
        key={key}>
        <div className="py-2 pl-2 pr-1 text-[15px]]">{key}.</div>
        <div className="py-2">
          <input
            name={key}
            className="w-full bg-grey-100"
            value={values.mnemonic[parseInt(key)]}
            onChange={(e) =>
              setFieldValue('mnemonic', { ...values.mnemonic, [key]: e.target.value })
            }
          />
        </div>
      </div>
    ));
  }, [values.mnemonic, setFieldValue]);

  const onNext = useCallback(async () => {
    try {
      const mnemonic = normalizeMnemonic(mnemonicInput.join(' '));
      const seed = await mnemonicToSeed(mnemonic);
      setFieldValue('seed', seed);
      setFieldValue('parsedMnemonic', mnemonic);
      goForward();
    } catch (error) {
      console.log('on next error', error);
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  }, [mnemonicInput, setFieldValue, goForward]);

  return (
    <div>
      <h4 className="font-bold text-grey-100 mb-2">Back Up Your Secret Phrase</h4>
      <div className="text-grey-100">
        Save these 12 words to a password manager, or write it down and store in a secure place. Do
        not share with anyone.
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-2 py-4 justify-center">{renderMnemonicList}</div>
      <Button
        className="w-[328px] absolute bottom-4"
        disabled={!mnemonicInput || mnemonicInput.length !== 12}
        onClick={onNext}>
        Continue
      </Button>
    </div>
  );
};

export default SeedWordsForm;
