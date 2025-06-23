export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export enum TaskStatusTypes {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done",
}
