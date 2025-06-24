import { useDraggable } from "@dnd-kit/core";

export type cardProps = {
  id: number;
  column: number;
  value: string;
};

function Card(props: cardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        margin: 30,
      }
    : { margin: 30 };
  return (
    <div
      ref={setNodeRef}
      className="card"
      style={style}
      {...listeners}
      {...attributes}
    >
      {props.value}
    </div>
  );
}

export default Card;
