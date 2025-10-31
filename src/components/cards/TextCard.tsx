export interface TextCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

const TextCard: React.FC<TextCardProps> = ({ title, children, className }) => {
  return (
    <div
      className={`${className} bg-[var(--color-bg)] flex flex-col items-start px-3 py-2 rounded-xl border border-transparent max-w-[25rem] max-h-[20rem] gap-2 shadow-md overflow-auto`}
    >
      <h1>{title}</h1>
      {children}
    </div>
  );
};

export default TextCard;
