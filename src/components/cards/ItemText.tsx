import React from "react";

export interface ItemTextProps {
  attributes: Record<string, string> | undefined;
  features: Record<string, string> | undefined;
  className?: string;
}

const ItemText: React.FC<ItemTextProps> = ({
  attributes,
  features,
  className,
}) => {
    const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) {
      return <span className="text-gray-600">{String(val)}</span>;
    }

    if (Array.isArray(val)) {
      return (
        <ul className="list-disc list-inside pl-4">
          {val.map((item, i) => (
            <li key={i} className="break-words">
              {renderValue(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof val === "object") {
      // If this object comes from Ditto it may wrap children under a `properties` key.
      // Unwrap it so the UI shows: parent -> childKey (skip the `properties` level).
      const obj = val as Record<string, any>;
      const children = obj.properties && typeof obj.properties === "object" ? obj.properties : obj;
      return (
        <ul className="list-disc list-inside pl-4">
          {Object.entries(children).map(([k, v]) => (
            <li key={k} className="break-words">
              <span className="font-semibold">{k}:</span> {renderValue(v)}
            </li>
          ))}
        </ul>
      );
    }

    // primitive
    return <span className="whitespace-normal break-words">{String(val)}</span>;
  };

  const parseFeatureValue = (v: string) => {
    try {
      return JSON.parse(v);
    } catch {
      // not JSON — return the raw string
      return v;
    }
  };

  return (
    <ul className={`flex flex-col gap-2 bg-transparent w-full ${className}`}>
      <li className="text-sm">
        <span className="font-bold">Attributes:</span>
        <ul className="list-disc list-inside pl-4 mt-1">
          {Object.entries(attributes ?? {}).map(([k, v]) => (
            <li key={k} className="break-words">
              <span className="font-semibold">{k}:</span> <span className="whitespace-normal">{v}</span>
            </li>
          ))}
        </ul>
      </li>
      <li className="text-sm">
        <span className="font-bold">Features:</span>
        <ul className="list-disc list-inside pl-4 mt-1">
          {Object.entries(features ?? {}).map(([k, v]) => (
            <li key={k} className="break-words">
              <div className="font-semibold">{k}:</div>
              <div className="mt-1">{renderValue(parseFeatureValue(v))}</div>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};

export default ItemText;
