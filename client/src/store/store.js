import { configureStore } from "@reduxjs/toolkit";
import globalSlice from "./slices/globalSlice";
import cartSlice from "./slices/cartSlice";

export default configureStore({
  reducer: {
    global: globalSlice,
    cart: cartSlice,
  },
});