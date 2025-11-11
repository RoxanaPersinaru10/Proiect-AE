import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.cart.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id);
    },
    updateCart: (state, action) => {
      const { id, quantity } = action.payload;

      const product = state.cart.find((item) => item.id === id);

      if (product) {
        product.quantity = quantity;
      }

      state.cart = state.cart.map((item) => (item.id === id ? product : item));
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { addToCart, updateCart, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;