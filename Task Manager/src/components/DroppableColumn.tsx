// components/DroppableColumn.tsx
import { useDroppable } from "@dnd-kit/core";
import { type TaskStatusTypes } from "../types/Task";

type Props = {
  status: TaskStatusTypes;
  children: React.ReactNode;
};

const DroppableColumn = ({ status, children }: Props) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="column" ref={setNodeRef}>
      <h2 className="title is-4 has-text-centered">
        {status.replace("-", " ").toUpperCase()}
      </h2>
      {children}
    </div>
  );
};

export default DroppableColumn;
