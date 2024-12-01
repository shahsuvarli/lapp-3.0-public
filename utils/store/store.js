import { configureStore } from "@reduxjs/toolkit";
import crmReducer from "utils/store/crmSlice";

export const store = configureStore({
  reducer: {
    crm: crmReducer,
  },
});
