export interface TodoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface TodoResponse {
  total: number;
  data: Array<TodoItem>;
  pageNumber: number;
  pageSize: number;
}
