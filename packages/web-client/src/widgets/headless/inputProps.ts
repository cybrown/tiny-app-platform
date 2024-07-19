export interface InputProps<T> {
  disabled?: boolean;
  onChange?: (newValue: T) => Promise<void>;
  value?: T;
}
