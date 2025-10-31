export type ItemType = {
  id: string;
  attributes?: Record<string, string>;
  features?: Record<string, string>;
  showHandles?: boolean;
  trailingIcon?: React.ReactNode;
  className?: string;
};
