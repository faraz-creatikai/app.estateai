import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary)",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-primary)",
          },
        },
      },
    },
  },
});
