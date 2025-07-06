import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addTodo } from "../features/todos/todosSlice";
import type { AppDispatch } from "../app/store";

const AddTodo: React.FC = () => {
  const [text, setText] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleAdd = () => {
    if (text.trim() === "") return;
    dispatch(addTodo(text));
    setText("");
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a todo"
        style={{ padding: "8px", width: "250px" }}
      />
      <button
        onClick={handleAdd}
        style={{ marginLeft: "10px", padding: "8px" }}
      >
        Add Todo
      </button>
    </div>
  );
};

export default AddTodo;
