import { useState } from "react";
import Navbar from "./components/Navbar";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import { TaskProvider } from "./context/TaskContext";

function App() {
  const [search, setSearch] = useState("");
  return (
    <TaskProvider>
      <Navbar search={search} setSearch={setSearch} />
      {search === "" && <TaskForm />}
      <TaskCard search={search} />
    </TaskProvider>
  );
}

export default App;
