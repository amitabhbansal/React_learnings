import "../styles/taskform.css";
import { useEffect, useId, useState } from "react";
import { TaskStatusTypes, type Task } from "../types/Task";
import { useTask } from "../context/TaskContext";

type inputDetails = {
  title: string;
  description: string;
  status: TaskStatusTypes;
};

type errorDetails = {
  title?: string;
  description?: string;
};

function TaskForm() {
  const titleId = useId();
  const despId = useId();
  const { addTask, taskToEdit, setTaskToEdit, updateTask } = useTask();
  const [input, setInput] = useState<inputDetails>({
    title: "",
    description: "",
    status: TaskStatusTypes.TODO,
  });

  const [errors, setErrors] = useState<errorDetails>({});

  const validate = () => {
    const newErrors: errorDetails = {};
    if (!input.title.trim()) newErrors.title = "Title is required";
    if (!input.description.trim())
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const refreshInput = () => {
    setInput({
      title: "",
      description: "",
      status: TaskStatusTypes.TODO,
    });
    setTaskToEdit(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: input.title,
        description: input.description,
        status: input.status,
      });
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        status: input.status,
        createdAt: new Date().toISOString(),
      };
      addTask(newTask);
    }
    refreshInput();
  };
  const handleCancel = () => {
    refreshInput();
  };

  useEffect(() => {
    if (taskToEdit) {
      setInput({
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status as TaskStatusTypes,
      });
    }
  }, [taskToEdit]);
  return (
    <div className="form-container">
      <div className="field">
        <label htmlFor={titleId} className="label">
          Title
        </label>
        <div className="control">
          <input
            className={`input ${errors.title ? "is-danger" : ""}`}
            id={titleId}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, title: e.target.value }));
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            type="text"
            placeholder="Title..."
            value={input?.title}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor={despId} className="label">
          Description
        </label>
        <div className="control">
          <input
            id={despId}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, description: e.target.value }));
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={`input ${errors.description ? "is-danger" : ""}`}
            type="text"
            placeholder="Description..."
            value={input?.description}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Status</label>
        <div className="control">
          <div className="select">
            <select
              value={input?.status}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  status: e.target.value as TaskStatusTypes,
                }))
              }
            >
              <option value={TaskStatusTypes.TODO}> To Do </option>
              <option value={TaskStatusTypes.IN_PROGRESS}> In Progress </option>
              <option value={TaskStatusTypes.DONE}> Done </option>
            </select>
          </div>
        </div>
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            className="button is-link"
            onClick={handleSubmit}
            disabled={!input.title.trim() || !input.description.trim()}
          >
            {taskToEdit ? "Update" : "Add"}
          </button>
        </div>
        <div className="control">
          <button className="button is-link is-light" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;
