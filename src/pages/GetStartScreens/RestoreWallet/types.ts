export interface FormValues {
  mnemonic: Record<number, string>;
  parsedMnemonic?: string;
  seed?: string;
  password: string;
  confirmPassword: string;
  dPathMenuItem: number;
}
