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
  const { errors, values, handleChange, touched, handleBlur } = useFormikContext<FormValues>();

  return (
    <div className="flex flex-col items-left gap-6 w-full h-full relative">
      <div className="flex flex-col gap-2">
        <h5 className="text-grey-100 font-bold">Name Your Wallet</h5>
        <div className="text-grey-100">Name your wallet to make it unique.</div>
      </div>
      <Form.Item
        {...formItemLayout}
        className="w-full text-lg font-bold"
        label={<div className="title font-bold text-grey-100">Name</div>}
        validateStatus={errors.walletName && touched.walletName ? 'error' : ''}
        help={errors.walletName && touched.walletName ? errors.walletName : ''}>
        <TextInput
          name="walletName"
          value={values.walletName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Wallet Name"
        />
      </Form.Item>
      <Button
        className="w-full absolute font-bold bottom-4"
        id="continue-btn"
        disabled={!values.walletName || !!errors.walletName}
        onClick={goForward}>
        <h6 className="text-inherit">Continue</h6>
      </Button>
    </div>
  );
};

export default WalletName;
