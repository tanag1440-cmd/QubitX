import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { StoreProvider } from "./lib/store";
import { ThemeProvider } from "./lib/theme";
import { I18nProvider } from "./lib/i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <StoreProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </StoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);