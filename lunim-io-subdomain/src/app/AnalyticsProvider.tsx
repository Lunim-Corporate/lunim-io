// src/app/AnalyticsProvider.tsx
import React from "react";

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
}

export default function AnalyticsProvider({ children }: Props) {
  return <>{children}</>;
}
