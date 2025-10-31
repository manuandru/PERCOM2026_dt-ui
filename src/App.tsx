import ItemText from "./components/cards/ItemText";
import TextCard from "./components/cards/TextCard";
import { useDnD } from "./hooks/UseDnD";
import { MapPage } from "./screens/Map";

function App() {
  const { selectedThing } = useDnD();

  return (
    <>
      <MapPage />
      {selectedThing && (
        <TextCard
          title={selectedThing.attributes?.model || "Unknown"}
          className="fixed bottom-0 left-0 m-5 z-10"
        >
          <ItemText
            attributes={selectedThing.attributes}
            features={selectedThing.features}
          />
        </TextCard>
      )}
    </>
  );
}

export default App;
