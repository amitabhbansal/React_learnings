import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTodo, deleteTodo } from "./todosSlice";
import type { RootState, AppDispatch } from "../../app/store";

const TodoList: React.FC = () => {
  const todos = useSelector((state: RootState) => state.todos);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={{
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            onClick={() => dispatch(toggleTodo(todo.id))}
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              cursor: "pointer",
              flex: 1,
            }}
          >
            {todo.text}
          </span>
          <button
            onClick={() => dispatch(deleteTodo(todo.id))}
            style={{ marginLeft: "10px" }}
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
