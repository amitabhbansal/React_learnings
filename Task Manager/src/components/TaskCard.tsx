import { useTask } from "../context/TaskContext";
import { TaskStatusTypes } from "../types/Task";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import DroppableColumn from "./DroppableColumn";
import DraggableTask from "./DraggableTask";
const TaskCard = ({ search }: { search: string }) => {
  const { tasks, removeTask, setTaskToEdit, updateTask, taskToEdit } =
    useTask();

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedTasks = {
    [TaskStatusTypes.TODO]: filteredTasks.filter(
      (t) => t.status === TaskStatusTypes.TODO
    ),
    [TaskStatusTypes.IN_PROGRESS]: filteredTasks.filter(
      (t) => t.status === TaskStatusTypes.IN_PROGRESS
    ),
    [TaskStatusTypes.DONE]: filteredTasks.filter(
      (t) => t.status === TaskStatusTypes.DONE
    ),
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id.toString();
    const newStatus = over.id.toString(); // column id
    const draggedTask = tasks.find((task) => task.id === taskId);

    if (draggedTask && draggedTask.status !== newStatus) {
      updateTask(taskId, { status: newStatus as TaskStatusTypes });
    }
  };

  // Determine card color by task status
  const getCardColor = (status: string) => {
    switch (status) {
      case TaskStatusTypes.TODO:
        return "has-background-warning-light";
      case TaskStatusTypes.IN_PROGRESS:
        return "has-background-info-light";
      case TaskStatusTypes.DONE:
        return "has-background-success-light";
      default:
        return "";
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="container p-5">
        <div className="columns">
          {Object.entries(groupedTasks).map(([status, tasks]) => (
            <DroppableColumn key={status} status={status as TaskStatusTypes}>
              {tasks.map((task) => {
                const isEditing = taskToEdit?.id === task.id;
                return (
                  <DraggableTask key={task.id} task={task}>
                    {(listeners) => (
                      <div
                        className={`card mb-4 ${getCardColor(task.status)} ${
                          isEditing ? "is-editing" : ""
                        }`}
                      >
                        <div className="card-content has-text-dark">
                          <p
                            className="title is-5 has-text-dark"
                            {...listeners}
                          >
                            {/* Make just the title draggable */}
                            {task.title}
                          </p>
                          <p className="subtitle is-6 has-text-dark">
                            {task.description}
                          </p>
                          <p className="is-size-7 has-text-grey-dark">
                            Created: {new Date(task.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <footer className="card-footer">
                          <a
                            className="card-footer-item has-text-danger"
                            onClick={() => removeTask(task.id)}
                          >
                            Delete
                          </a>
                          <a
                            className="card-footer-item has-text-link"
                            onClick={() => setTaskToEdit(task)}
                          >
                            Edit
                          </a>
                        </footer>
                      </div>
                    )}
                  </DraggableTask>
                );
              })}
            </DroppableColumn>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default TaskCard;
