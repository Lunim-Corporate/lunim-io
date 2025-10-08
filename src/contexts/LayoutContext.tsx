"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

type LayoutDataContextType = Content.LayoutDocument | null;

const LayoutContext = createContext<LayoutDataContextType>(null);

export const LayoutProvider: React.FC<{
  children: ReactNode;
  initialData?: LayoutDataContextType;
}> = ({ children, initialData }) => {
  const [layout, setLayout] = useState<LayoutDataContextType>(initialData ?? null);

  useEffect(() => {
    // Fetch only if no server data was passed
    if (!layout) {
      const client = createClient();
      client.getSingle("layout").then(setLayout).catch(() => {});
    }
  }, [layout]);

  return (
    <LayoutContext.Provider value={layout}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutData = () => useContext(LayoutContext);