import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TodoItem, TodoResponse } from './todo-response';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private http = inject(HttpClient);

  getTodo(pageNumber: number): Observable<TodoResponse> {
    return this.http.get<Array<TodoItem>>(`https://jsonplaceholder.typicode.com/todos?_page=${pageNumber}&_limit=10`).pipe(
      map(data => ({
        total: 100,
        pageSize: 10,
        pageNumber,
        data
      }))
    );
  }
}
