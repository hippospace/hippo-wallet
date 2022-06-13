import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormik } from 'formik';
import { LockIcon } from 'resources/icons';
import { updateMnemonicAndSeed } from 'utils/wallet-seed';
import * as yup from 'yup';

interface TFormProps {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface TProps {
  onSuccess: () => void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required(),
  password: yup.string().min(8, 'at least 8 characters').required(),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
});

const ChangePassword: React.FC<TProps> = ({ onSuccess }) => {
  const onSubmit = async (values: TFormProps) => {
    try {
      const { password, currentPassword } = values;
      await updateMnemonicAndSeed(currentPassword, password);
      onSuccess();
    } catch (error) {
      console.log('update wallet password error:', error);
      if (error instanceof Error) {
        formik.setFieldError('currentPassword', error.message);
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: changePasswordSchema,
    onSubmit
  });

  return (
    <form className="flex flex-col items-center w-full gap-10" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col gap-2 items-center">
        <LockIcon />
        <h3 className="text-grey-900 font-bold">Change Password</h3>
      </div>
      <div className="mt-2 flex flex-col items-center text-center gap-3 w-full">
        <Form.Item
          {...formItemLayout}
          className="w-full"
          validateStatus={
            formik.touched.confirmPassword && formik.errors.currentPassword ? 'error' : ''
          }
          help={
            formik.touched.confirmPassword && formik.errors.currentPassword
              ? formik.errors.currentPassword
              : ''
          }>
          <TextInput
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            onBlur={formik.handleBlur}
            value={formik.values.currentPassword}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className="w-full"
          validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
          help={formik.touched.password && formik.errors.password ? formik.errors.password : ''}>
          <TextInput
            type="password"
            name="password"
            placeholder="New Password"
            onBlur={formik.handleBlur}
            value={formik.values.password}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className="w-full"
          validateStatus={
            formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''
          }
          help={
            formik.touched.confirmPassword && formik.errors.confirmPassword
              ? formik.errors.confirmPassword
              : ''
          }>
          <TextInput
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
          />
        </Form.Item>
        <div className="flex w-full justify-between mt-20">
          <Button variant="outlined" className="w-[230px] font-bold" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="w-[230px] font-bold">
            Update
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChangePassword;
