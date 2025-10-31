import { useEffect, useState } from "react";
import DittoApi from "../../api/DittoApi";
import { DataContext } from "./DataContext";
import { thingFromJson, type Thing } from "../../types/Thing";

const LOCATION_REGEX = /(\d+\.\d+),(\d+\.\d+)/g;

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [things, setThings] = useState<Map<string, Thing>>(new Map());
  const [attributes, setAttributes] = useState<Array<string>>([]);
  const [features, setFeatures] = useState<Array<string>>([]);
  const [firstThingLocation, setFirstThingLocation] = useState<
    { longitude: number; latitude: number } | undefined
  >();

  useEffect(() => {
    const thing = Array.from(things.values()).find((t) =>
      hasValidLocation(t.attributes?.location)
    );
    if (thing) {
      setFirstThingLocation(getThingLocation(thing));
    }
  }, [things]);

  const hasValidLocation = (location: string | undefined): boolean => {
    if (!location) {
      return false;
    }
    const matches = location.match(LOCATION_REGEX);
    return (matches && matches?.length > 0) ?? false;
  };

  const getThingLocation = (
    thing: Thing
  ): { longitude: number; latitude: number } => {
    const matches = thing.attributes?.location?.matchAll(LOCATION_REGEX);

    if (!matches) {
      throw new Error("No matches found");
    }

    const matchArray = Array.from(matches);

    if (matchArray.length === 0) {
      throw new Error("No valid location found");
    }

    const [match] = matchArray;

    return {
      latitude: Number(match[1]),
      longitude: Number(match[2]),
    };
  };

  const fetchThings = async () => {
    const result = new Map<string, Thing>();
    await DittoApi.getThings().then((data) =>
      data.forEach((item) => {
        const thing = thingFromJson(item);
        result.set(thing.id, thing);
      })
    );
    setThings(result);
    const uniqueAttributes = Array.from(
      new Set(
        Array.from(result.values()).flatMap((t) =>
          Object.keys(t.attributes ?? {})
        )
      )
    );
    setAttributes(uniqueAttributes);
    const uniqueFeatures = Array.from(
      new Set(
        Array.from(result.values()).flatMap((t) =>
          Object.keys(t.features ?? {})
        )
      )
    );
    setFeatures(uniqueFeatures);
    setError(null);
  };

  useEffect(() => {
    fetchThings();
    DittoApi.eventSource.listen({
      async onMessage(event) {
        if (event.data) {
          const thing = thingFromJson(JSON.parse(event.data));
          if (
            Object.keys(thing.attributes).length === 0 &&
            Object.keys(thing.features).length === 0 &&
            thing.id
          ) {
            setThings((t) => {
              const newThings = new Map(t);
              newThings.delete(thing.id);
              return newThings;
            });
          } else {
            setThings((t) => {
              const newThings = new Map(t);
              newThings.set(thing.id, thing);
              return newThings;
            });
          }
        }
      },
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        things,
        error,
        firstThingLocation,
        getThingLocation,
        hasValidLocation,
        attributes,
        features,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
