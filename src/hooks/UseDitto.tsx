import { useContext } from "react";
import { DataContext } from "../context/data-server/DataContext";

export const useDitto = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDitto must be used within a DittoProvider");
  }
  return context;
};
