import { createContext } from "react";
import type { Thing } from "../../types/Thing";

type DataContextType = {
  things: Map<string, Thing>;
  error: string | null;
  firstThingLocation?: { longitude: number; latitude: number };
  getThingLocation: (thing: Thing) => { longitude: number; latitude: number };
  hasValidLocation: (location: string | undefined) => boolean;
  attributes?: string[];
  features?: string[];
};

export const DataContext = createContext<DataContextType>({
  things: new Map(),
  error: null,
  firstThingLocation: undefined,
  getThingLocation: () => ({ longitude: 0, latitude: 0 }),
  hasValidLocation: () => false,
  attributes: [],
  features: [],
});
