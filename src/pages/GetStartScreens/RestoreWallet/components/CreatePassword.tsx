import { Form } from 'components/Antd';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import { useFormikContext } from 'formik';
import { FormValues } from '../types';

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const CreatePassword: React.FC = () => {
  const { handleChange, values, errors, isValid, touched, handleBlur, submitForm, isSubmitting } =
    useFormikContext<FormValues>();

  return (
    <div className="flex flex-col items-left gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h4 className="text-grey-100 font-bold">Create New Password</h4>
        <div className="text-grey-100">
          Set up a password to unlock your wallet each time when you use your wallet. It can’t be
          used for recover your wallet
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Form.Item
          {...formItemLayout}
          className="w-full"
          label={<div className="title font-bold text-grey-100">Password</div>}
          validateStatus={errors.password && touched.password ? 'error' : ''}
          help={
            <div className="text-grey-100">
              {errors.password && touched.password
                ? errors.password
                : 'At least 8 charaters, with at least 1 number and a special charater'}
            </div>
          }>
          <TextInput
            type="password"
            name="password"
            onBlur={handleBlur}
            value={values.password}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          className="w-full"
          label={<div className="title font-bold text-grey-100">Verify Password</div>}
          validateStatus={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
          help={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : ''}>
          <TextInput
            name="confirmPassword"
            type="password"
            onBlur={handleBlur}
            value={values.confirmPassword}
            onChange={handleChange}
          />
        </Form.Item>
      </div>
      <Button
        onClick={submitForm}
        isLoading={isSubmitting}
        className="w-[328px] absolute bottom-4 font-bold"
        disabled={!isValid}>
        <h6 className="text-inherit">Continue</h6>
      </Button>
    </div>
  );
};

export default CreatePassword;
