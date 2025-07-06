import "./App.css";
import AddTodo from "./components/AddTodo";
import TodoList from "./features/todos/TodoList";

function App() {
  return (
    <>
      <div
        style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}
      >
        <h1>📝 Todo App (Redux Toolkit + TypeScript)</h1>
        <AddTodo />
        <TodoList />
      </div>
    </>
  );
}

export default App;
