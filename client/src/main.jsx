import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate
      loading={<div>Se încarcă datele salvate...</div>}
      persistor={persistor}
      onBeforeLift={() => {
        console.log("PersistGate rehydrated complet!");
      }}
    >
      <App />
      <ToastContainer />
    </PersistGate>
  </Provider>
);
