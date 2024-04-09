import { Routes } from "@generouted/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import "@unocss/reset/tailwind-compat.css";
import "uno.css";
import "@/assets/styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
);
