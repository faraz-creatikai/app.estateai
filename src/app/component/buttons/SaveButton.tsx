import { ReactNode } from "react";
interface SaveButtonProps {
  text: string;
  icon?:ReactNode;
  className?:string;
  onClick?: () => void;
}

export default function SaveButton({ text,icon,className, onClick }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center float-right gap-2 bg-gradient-to-r cursor-pointer 
        from-[var(--color-primary-dark)] to-[var(--color-secondary)] 
        hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-dark)] 
        text-white px-4 py-2 rounded-md font-semibold max-sm:text-lg ${className}`}
    >
      {icon}
      {text}
    </button>
  );
}
