import { Handle, Position } from "@xyflow/react";
import React, { useState } from "react";
import { MdArrowRight } from "react-icons/md";
import type { ItemType } from "../../types/ItemType";
import ItemText from "../cards/ItemText";

const VerboseItem: React.FC<ItemType> = ({
  id,
  attributes,
  features,
  showHandles = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`${className} cursor-pointer bg-[var(--color-surface)] flex flex-col items-start px-3 py-2 rounded-xl border border-transparent overflow-auto max-h-[20rem] ${
        showHandles ? "w-[20rem]" : "w-full"
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between w-full">
        <h1>{attributes?.model}</h1>
        <div className={`transform ${isOpen ? "rotate-90" : ""}`}>
          <MdArrowRight />
        </div>
      </div>
      {isOpen && <ItemText attributes={attributes} features={features} />}
      {showHandles && (
        <Handle
          id={`${id}-target`}
          type="target"
          position={Position.Top}
          isConnectable={true}
          className="!w-2 !h-2 !bg-[var(--color-primary)]"
        />
      )}
      {showHandles && (
        <Handle
          id={`${id}-source`}
          type="source"
          position={Position.Bottom}
          isConnectable={true}
          className="!w-2 !h-2 !bg-[var(--color-primary)]"
        />
      )}
    </div>
  );
};

export default VerboseItem;
