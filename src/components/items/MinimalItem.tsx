import { useDnD } from "../../hooks/UseDnD";
import type { ItemType } from "../../types/ItemType";

export const MinimalItem: React.FC<ItemType> = ({
  id,
  attributes,
  className,
}) => {
  const { saveSelectedThing, selectedThing } = useDnD();
  const isSelected = selectedThing?.id === id;

  const handleClick = () => {
    if (selectedThing?.id === id) {
      saveSelectedThing(null);
    } else {
      saveSelectedThing(id);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col items-center ${className}`}
        onClick={handleClick}
      >
        <h1 className="pb-1">{attributes?.model}</h1>
        <div>
          <svg
            className={`rounded-full shadow-md transition-transform duration-150 ${isSelected ? 'scale-150 shadow-10xl' : ''}`}
            width="37"
            height="37"
            viewBox="0 0 37 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="18.5"
              cy="18.5"
              r="18.5"
              fill={selectedThing?.id === id ? "#FBFAFF" : "#3A8C9A"}
            />
            <path
              d="M18.5 0C28.7173 0 37 8.28273 37 18.5C37 28.7173 28.7173 37 18.5 37C8.28273 37 0 28.7173 0 18.5C0 8.28273 8.28273 0 18.5 0ZM18.5 5C11.0442 5 5 11.0442 5 18.5C5 25.9558 11.0442 32 18.5 32C25.9558 32 32 25.9558 32 18.5C32 11.0442 25.9558 5 18.5 5Z"
              fill={selectedThing?.id === id ? "#3A8C9A" : "#FBFAFF"}
            />
            <circle
              cx="18.5"
              cy="18.5"
              r="7.5"
              fill={selectedThing?.id === id ? "#3A8C9A" : "#FBFAFF"}
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default MinimalItem;
