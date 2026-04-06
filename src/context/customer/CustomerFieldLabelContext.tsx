"use client";

import { getCustomerFieldLabel } from "@/store/settings/customer/customerfields/customerfields";
import React, { createContext, useContext, useEffect, useState } from "react";

type LabelMap = Record<string, string>;

interface CustomerFieldLabelContextType {
  labels: LabelMap;
  getLabel: (fieldKey: string, defaultLabel?: string) => string;
  updateLabel: (fieldKey: string, displayLabel: string) => void;
  refreshLabels: () => Promise<void>;
}

const CustomerFieldLabelContext =
  createContext<CustomerFieldLabelContextType | null>(null);

export const CustomerFieldLabelProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [labels, setLabels] = useState<LabelMap>({});

  // 🔹 Initial + manual reload
  const loadLabels = async () => {
    const res = await getCustomerFieldLabel();
    if (res) setLabels(res);
  };

  useEffect(() => {
    loadLabels();
  }, []);

  // 🔹 Read label
  const getLabel = (fieldKey: string, defaultLabel?: string) => {
    return labels[fieldKey] || defaultLabel || fieldKey;
  };

  // REAL-TIME UPDATE (no refresh needed)
  const updateLabel = (fieldKey: string, displayLabel: string) => {
    setLabels((prev) => ({
      ...prev,
      [fieldKey]: displayLabel,
    }));
  };

  return (
    <CustomerFieldLabelContext.Provider
      value={{
        labels,
        getLabel,
        updateLabel,
        refreshLabels: loadLabels,
      }}
    >
      {children}
    </CustomerFieldLabelContext.Provider>
  );
};

export const useCustomerFieldLabel = () => {
  const context = useContext(CustomerFieldLabelContext);
  if (!context) {
    throw new Error(
      "useCustomerFieldLabel must be used inside CustomerFieldLabelProvider"
    );
  }
  return context;
};
