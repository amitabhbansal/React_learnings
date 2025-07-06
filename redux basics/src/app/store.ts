import { configureStore } from "@reduxjs/toolkit";

import todosReducer from "../features/todos/todosSlice";

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
});

// These are helper types that make Redux + TypeScript work better
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
