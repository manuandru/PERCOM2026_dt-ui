import { useContext } from "react";
import { DnDContext } from "../context/dnd/DnDContext";

export const useDnD = () => {
  return useContext(DnDContext);
};
