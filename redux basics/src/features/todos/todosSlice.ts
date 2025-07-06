import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Todo } from "../../types/todo";
import { v4 as uuidv4 } from "uuid";

const initialState: Todo[] = [];
const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      const newTodo: Todo = {
        id: uuidv4(),
        text: action.payload,
        completed: false,
      };
      state.push(newTodo);
    },

    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    deleteTodo: (state, action: PayloadAction<string>) => {
      return state.filter((t) => t.id !== action.payload);
    },
  },
});
export const { addTodo, toggleTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;
