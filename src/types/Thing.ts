export interface Thing {
  id: string;
  attributes: Record<string, string>;
  features: Record<string, string>;
}

const toStr = (v: unknown): string =>
  v === undefined
    ? "undefined"
    : v === null
    ? "null"
    : typeof v === "string"
    ? v
    : JSON.stringify(v);

const parseAttr = (
  v: Record<string, unknown> | undefined
): Record<string, string> => {
  if (!v) {
    return {};
  }
  const result: Record<string, string> = {};
  Object.entries(v).forEach(([k, v]) => (result[k] = toStr(v)));
  return result;
};

export function thingFromJson(obj: Record<string, unknown>): Thing {
  return {
    id: toStr(obj.thingId),
    attributes: parseAttr(obj.attributes as Record<string, unknown>),
    features: parseAttr(obj.features as Record<string, unknown>),
  };
}
