import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormikContext } from 'formik';
import { FormValues } from '../types';

interface TProps {
  goForward: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const WalletName: React.FC<TProps> = ({ goForward }) => {
  const { errors, values, handleChange } = useFormikContext<FormValues>();

  return (
    <div className="flex flex-col items-left gap-10 w-full">
      <div className="flex flex-col gap-4">
        <h4 className="text-grey-900 font-bold">Name Your Wallet</h4>
        <div className="">Name your wallet to make it unique.</div>
      </div>
      <Form.Item
        {...formItemLayout}
        className="w-full"
        label="Name"
        validateStatus={errors.walletName ? 'error' : ''}
        help={errors.walletName}>
        <TextInput name="walletName" value={values.walletName} onChange={handleChange} />
      </Form.Item>
      <Button
        className="w-[430px] mx-auto font-bold mt-40"
        disabled={!values.walletName || !!errors.walletName}
        onClick={goForward}>
        <h6 className="text-inherit">Continue</h6>
      </Button>
    </div>
  );
};

export default WalletName;
