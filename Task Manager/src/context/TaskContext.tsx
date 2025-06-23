import { createContext, useContext, useEffect, useState } from "react";
import type { Task } from "../types/Task";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  taskToEdit: Task | null;
  setTaskToEdit: (task: Task | null) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(
  undefined
);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
const getInitialTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((p) => p.id !== taskId));
  };

  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((p) => (p.id === taskId ? { ...p, ...updatedTask } : p))
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        removeTask,
        updateTask,
        taskToEdit,
        setTaskToEdit,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
