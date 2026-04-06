// LeadsSectionData.tsx
"use client";

import LeadsSection, { LabelConfig } from "./LeadsSection";

export default function LeadsSectionData() {
  const leads = [
    {
      campaign: "Graduation",
      type: "B.COM",
      city: "jhunjhunu",
      name: "rajalakshmi",
      number: "1234567890",
    },
    {
      campaign: "Graduation",
      type: "B.COM",
      city: "jaipur",
      name: "n.amirudeen",
      number: "1234567890",
    },
  ];

  // annotate using the shape of the first lead item
  const labelLeads = [
    { key: "campaign", label: "Campaign" },
    { key: "type", label: "Lead Type" },
    { key: "city", label: "City" },
    { key: "name", label: "Name" },
    { key: "number", label: "Contact No" },
  ];

  return (
    <div className="min-h-screen">
      <LeadsSection leads={leads} labelLeads={labelLeads} />
    </div>
  );
}
