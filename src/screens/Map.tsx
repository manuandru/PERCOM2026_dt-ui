import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDitto } from "../hooks/UseDitto";
import MinimalItem from "../components/items/MinimalItem";

export function MapPage() {
  const { things, firstThingLocation, hasValidLocation, getThingLocation } =
    useDitto();
  return (
    <Map
      initialViewState={{
        latitude: firstThingLocation?.latitude ?? 44.147388,
        longitude: firstThingLocation?.longitude ?? 12.2313704,
        zoom: 10,
      }}
      style={{ width: "100vw", height: "100vh" }}
      mapStyle="src/map-style.json"
    >
      {Array.from(things.values())
        ?.filter((t) => hasValidLocation(t.attributes?.location))
        .map((t) => (
          <Marker
            key={t.id}
            latitude={getThingLocation(t).latitude}
            longitude={getThingLocation(t).longitude}
            anchor="bottom"
          >
            <MinimalItem
              id={t.id ?? "Unknown Thing"}
              attributes={t.attributes}
              showHandles={false}
            />
          </Marker>
        ))}
    </Map>
  );
}
