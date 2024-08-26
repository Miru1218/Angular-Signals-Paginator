import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { switchMap } from 'rxjs';
import { TodoService } from './todo.service';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCheckboxModule, JsonPipe],
  template: `
    <!-- todo list -->
    <table mat-table [dataSource]="todoItems()">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let element">{{ element.id }}</td>
      </ng-container>
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let element">{{ element.title }}</td>
      </ng-container>
      <ng-container matColumnDef="completed">
        <th mat-header-cell *matHeaderCellDef>Completed</th>
        <td mat-cell *matCellDef="let element">
          <mat-checkbox [checked]="element.completed" disabled></mat-checkbox>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['id', 'title', 'completed']"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: ['id', 'title', 'completed']"
      ></tr>
    </table>

    <!-- 顯示總數 -->
    <!-- <div class="total-items">
      Total Items: {{ total() }}
    </div> -->

    <!-- 顯示 todoItems 數據 -->
    <!-- <section class="todo-items-debug">
    <pre>{{ todoItems() | json }}</pre>
    </section> -->

    <!-- pagination -->
    <section class="pagination">
      <button
        mat-raised-button
        (click)="goPage(1)"
        [disabled]="pageNumber() === 1"
      >
        First Page
      </button>

      <button
        mat-raised-button
        (click)="prevPage()"
        [disabled]="!canGoPrevPage()"
      >
        Prev Page
      </button>

      <div class="current-page">{{ pageNumber() }} / {{ pageSize() }}</div>

      <button
        mat-raised-button
        (click)="nextPage()"
        [disabled]="!canGoNextPage()"
      >
        Next Page
      </button>

      <button
        mat-raised-button
        (click)="goPage(pageSize())"
        [disabled]="pageNumber() === pageSize()"
      >
        Last Page
      </button>
    </section>
  `,
  styles: `
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    .current-page {
      margin: 0 10px;
      min-width: 75px;
      text-align: center;
    }

    .mdc-button--raised {
      margin: 0 5px;
    }
  }
  `,
})
export class AppComponent implements OnDestroy {
  private todoService = inject(TodoService);

  protected pageNumber = signal(1); // 當前頁碼 Signal

  private pageNumber$ = toObservable(this.pageNumber); // 將 Signal 轉換為 Observable

  private todoResponse$ = this.pageNumber$.pipe(
    switchMap((pageNumber) => this.todoService.getTodo(pageNumber)) // 根據頁碼請求待辦事項數據
  );

  private todoResponse = toSignal(this.todoResponse$, {
    initialValue: { data: [], total: 0, pageNumber: 0, pageSize: 0 }, // 設置初始值
  });

  protected todoItems = computed(() => this.todoResponse().data); // 計算當前頁面的待辦事項
  protected total = computed(() => this.todoResponse().total); // 計算待辦事項總數
  protected pageSize = computed(() => this.todoResponse().pageSize); // 計算頁面大小
  protected canGoPrevPage = computed(() => this.pageNumber() > 1); // 計算是否可以前往上一頁
  protected canGoNextPage = computed(
    () => this.pageNumber() * this.pageSize() < this.total()
  ); // 計算是否可以前往下一頁

  // 用於記錄當前頁碼和輸出待辦事項數據
  private logTodoResponse = effect(() => {
    localStorage.setItem('pageNumber', this.pageNumber().toString()); // 將當前頁碼存入 localStorage
    console.log(this.todoResponse());
  });

  // 銷毀 logTodoResponse
  ngOnDestroy(): void {
    this.logTodoResponse.destroy();
  }

  // 前往上一頁
  prevPage() {
    if (this.canGoPrevPage()) {
      this.pageNumber.update((page) => page - 1);
    }
  }

  // 前往下一頁
  nextPage() {
    if (this.canGoNextPage()) {
      this.pageNumber.update((page) => page + 1);
    }
  }

  // 前往指定頁碼
  goPage(pageNumber: number): void {
    this.pageNumber.set(pageNumber);
  }
}
