import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import "./App.css";
import Card from "./Card";
import type { cardProps } from "./Card";
import Column from "./assets/column";
import { useState } from "react";

function App() {
  const [data, setData] = useState<cardProps[]>([
    { id: 0, column: 1, value: "hi" },
    { id: 1, column: 2, value: "bye" },
    { id: 2, column: 3, value: "see ya" },
    { id: 3, column: 1, value: "hello" },
    { id: 4, column: 2, value: "goodbye" },
    { id: 5, column: 3, value: "farewell" },
  ]);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const id = Number(active.id);
    const newColumn = Number(over.id);

    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, column: newColumn } : item
      )
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="parent">
        {[1, 2, 3].map((col) => (
          <Column id={col}>
            {data
              .filter((item) => item.column === col)
              .map((item) => (
                <Card key={item.id} {...item} />
              ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}

export default App;
