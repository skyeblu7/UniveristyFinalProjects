import "./App.css";

import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider
} from "@mui/material/styles";
import React from "react";

import HomePage from "./HomePage";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#13294B",
      },
      secondary: {
        main: "#FF5F05",
      },
      info: {
        main: "#009FD4",
      },
    },
  })
);

function App() {
  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>
    </React.StrictMode>
  );
}

export default App;
