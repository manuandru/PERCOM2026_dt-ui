import { useEffect, useState } from "react";
import { useDitto } from "../../hooks/UseDitto";
import type { Thing } from "../../types/Thing";
import { DnDContext } from "./DnDContext";

export const DnDProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedThing, setSelectedThing] = useState<Thing | null>(null);
  const [nodesUpdated, setNodesUpdated] = useState(false);
  const { things } = useDitto();

  const saveSelectedThing = (id: string | null) => {
    setSelectedThing(id ? things.get(id) ?? null : null);
  };

  useEffect(() => {

    if (selectedThing) {
      if (things.has(selectedThing.id)) {
        setSelectedThing(things.get(selectedThing.id) ?? null);
      } else {
        setSelectedThing(null);
      }
    }

    if (nodesUpdated) {
      return;
    }

    setNodesUpdated(true);
  }, [things, nodesUpdated, selectedThing]);

  useEffect(() => {
    setNodesUpdated(false);
  }, [things]);

  return (
    <DnDContext.Provider
      value={{
        selectedThing,
        saveSelectedThing,
      }}
    >
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;
