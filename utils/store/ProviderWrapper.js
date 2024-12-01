"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from "notistack";

function ProviderWrapper({ children }) {
  return (
    <SnackbarProvider maxSnack={3} preventDuplicate>
      <Provider store={store}>
        <SessionProvider>{children}</SessionProvider>
      </Provider>
    </SnackbarProvider>
  );
}

export default ProviderWrapper;
