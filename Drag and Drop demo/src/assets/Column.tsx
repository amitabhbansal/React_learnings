import { useDroppable } from "@dnd-kit/core";
type Props = {
  id: number;
  children: React.ReactNode;
};
function Column({ id, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="child">
      <h3>Column {id}</h3>
      {children}
    </div>
  );
}

export default Column;
