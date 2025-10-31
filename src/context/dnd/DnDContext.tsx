import { createContext } from "react";
import type { Thing } from "../../types/Thing";

type DnDContextType = {
  selectedThing: Thing | null;
  saveSelectedThing: (id: string | null) => void;
};

export const DnDContext = createContext<DnDContextType>({
  selectedThing: null,
  saveSelectedThing: () => {},
});
