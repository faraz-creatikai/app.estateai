"use client";
import { IoIosArrowForward } from "react-icons/io";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

interface LeadStatusItem {
  name: string;
}

interface LeadStatusProps {
  leadStatuses: LeadStatusItem[];
}

export default function LeadStatus({ leadStatuses }: LeadStatusProps) {
  const router = useRouter();
  // Your color palette
  const objectcolor = [
    "#7C3AED", // purple
    "#3B82F6", // blue
    "#F97316", // orange
    "#22C55E", // green
    "#8B5CF6", // light purple
    "#9CA3AF", // gray
    "#FB923C", // light orange 
  ];

    const handleClick = (name: string) => {
    router.push(`/followups/customer?StatusType=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen">
      <div className=" px-0 py-4 flex flex-col gap-4">
        {leadStatuses.map((status, index) => {
          const colorIndex = index % objectcolor.length;

          return (
            <Button
              key={index}
              variant="contained"
              fullWidth
              onClick={() => handleClick(status.name)}
              sx={{
                backgroundColor: objectcolor[colorIndex],
                minWidth: "32px",
                height: "48px",
                borderRadius: "12px",
                justifyContent: "space-between",
                paddingLeft: "16px",
                paddingRight: "16px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
              }}
              className="text-white shadow-md"


            >
              {status.name}
              <IoIosArrowForward />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
