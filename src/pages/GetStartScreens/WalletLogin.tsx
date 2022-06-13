import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import LogoIcon from 'components/LogoIcon';
import * as yup from 'yup';
import { loadMnemonicAndSeed } from 'utils/wallet-seed';
import CheckboxInput from 'components/CheckboxInput';

interface TFormProps {
  password: string;
  stayLoggedIn: boolean;
}

interface TProps {
  onRecoverPassword: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const connectWalletSchema = yup.object({
  password: yup.string().required()
});

const WalletLogin: React.FC<TProps> = ({ onRecoverPassword }) => {
  const onSubmit = async (values: TFormProps) => {
    try {
      const { password, stayLoggedIn } = values;
      await loadMnemonicAndSeed(password, stayLoggedIn);
    } catch (error) {
      console.log('create new wallet error:', error);
      if (error instanceof Error) {
        formik.setErrors({ password: error.message });
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      stayLoggedIn: false
    },
    validationSchema: connectWalletSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col items-center px-9 py-10" onSubmit={formik.handleSubmit}>
      <LogoIcon className="mt-8 w-[120px] h-[120px]" />
      <div className="mt-10 flex flex-col items-center text-center gap-8 w-full">
        <h4 className="text-grey-900 font-bold">Enter Your Password</h4>
        <div className="flex flex-col w-full items-start">
          <Form.Item
            {...formItemLayout}
            className="w-full"
            validateStatus={formik.errors.password ? 'error' : ''}
            help={formik.errors.password}>
            <TextInput
              type="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
          </Form.Item>
          <CheckboxInput
            checked={formik.values.stayLoggedIn}
            onChange={(e) => formik.setFieldValue('stayLoggedIn', e.target.checked)}>
            <div className="text-grey-900">Keep wallet unlocked</div>
          </CheckboxInput>
        </div>
        <div className="w-full px-8 pt-20">
          <Button type="submit" className="w-full font-bold" isLoading={formik.isSubmitting}>
            <h6 className="text-inherit">Unlock</h6>
          </Button>
        </div>
        <div className="text-grey-900 font-bold cursor-pointer" onClick={onRecoverPassword}>
          Recover your master password
        </div>
      </div>
    </form>
  );
};

export default WalletLogin;
