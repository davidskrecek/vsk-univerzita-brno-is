import { IoPencilOutline } from "react-icons/io5";

interface EditButtonProps {
  onClick: () => void;
  className?: string;
  title?: string;
}

export const EditButton = ({ onClick, className = "", title = "Upravit" }: EditButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`group flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high text-on-surface/40 hover:bg-primary hover:text-on-primary hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg ${className}`}
    >
      <IoPencilOutline size={18} className="transition-transform group-hover:rotate-12" />
    </button>
  );
};

export default EditButton;

