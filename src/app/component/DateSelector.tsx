import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useThemeCustom } from "@/context/ThemeContext";

dayjs.extend(customParseFormat);

/* ---------- helper ---------- */
const parseDate = (str: string) => {
  if (!str) return null;

  let d = dayjs(str);
  if (d.isValid()) return d;

  d = dayjs(str, "DD-MM-YYYY");
  return d.isValid() ? d : null;
};

/* ---------- component ---------- */
interface DateSelectorProps {
  label: string;
  value?: string;
  onChange?: (selected: string) => void;
  error?: string;
}

export default function DateSelector({
  label,
  value,
  onChange,
}: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = React.useState<any>(
    value ? parseDate(value) : null
  );

  const { dark } = useThemeCustom();

  React.useEffect(() => {
    setSelectedDate(value ? parseDate(value) : null);
  }, [value]);

  const handleChange = (newValue: any) => {
    setSelectedDate(newValue);
    onChange?.(newValue ? newValue.format("DD-MM-YYYY") : "");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
          },
          minWidth: {
            md: 200,
            lg: 200,
          },
        }}
      >
        <DatePicker
          label={label}
          value={selectedDate}
          onChange={handleChange}
          format="DD-MM-YYYY"
          slots={{ textField: TextField }}
          slotProps={{
            textField: {
              fullWidth: true,

              InputLabelProps: {
                sx: (theme) => ({
                  // Always applied positioning
                  transform: "translate(1rem,0.8rem)",

                  "&.MuiInputLabel-shrink": {
                    transform: "translate(1rem,-0.5rem)",
                    fontSize: "12px",
                  },

                  // Dark only on max-sm
                  ...(dark && {
                    [theme.breakpoints.down("sm")]: {
                      color: "#9CA3AF",
                      "&.Mui-focused": {
                        color: "#9CA3AF",
                      },
                    },
                  }),
                }),
              },

              sx: (theme) => ({
                // Always applied
                "& .MuiInputBase-root": {
                  borderRadius: "8px",
                  maxHeight: "3rem",
                },

                // Dark only on max-sm
                ...(dark && {
                  [theme.breakpoints.down("sm")]: {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#374151",
                    },

                    "& .MuiInputBase-root": {
                      color: "#D1D5DB",
                    },

                    "& .MuiSvgIcon-root": {
                      color: "#9CA3AF",
                    },
                  },
                }),
              }),
            },
          }}
          enableAccessibleFieldDOMStructure={false}
        />
      </FormControl>
    </LocalizationProvider>
  );
}
