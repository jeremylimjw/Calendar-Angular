import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Cell {
  day: number;
  month: number;
  year: number;
  string: string;
  value: number;
}

interface Task {
  name: string;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.less']
})
export class CalendarComponent implements OnInit {

  _calendar = new BehaviorSubject<Date>(new Date());

  today = new Date();
  cells: Cell[] = [];

  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  newTaskName: string = '';

  tasks: { [monthYear: string]: { [day: string]: Task[] } } = {};

  constructor() { }

  ngOnInit(): void {
    /** Generate dates when calendar value changes. */
    this._calendar.subscribe(date => {
      this.generateDates(date);
    })
  }

  generateDates(date: Date): void {
    // retrieve tasks from db.
    this.cells = [];
    const pointer = new Date(date.getTime());
    const selectedMonth = pointer.getMonth();
    pointer.setDate(1);

    /** Start on the first sunday. */
    if (pointer.getDay() !== 7) {
      pointer.setDate(pointer.getDate() - pointer.getDay())
    }

    /** End iteration when reach next month and is a Sunday. */
    while (pointer.getMonth() !== (selectedMonth + 1) % 12 || pointer.getDay() !== 0) {
      this.cells.push({ 
        day: pointer.getDate(), 
        month: pointer.getMonth(),
        year: pointer.getFullYear(),
        string: pointer.toDateString(),
        value: pointer.getTime()
      })

      pointer.setDate(pointer.getDate() + 1);
    }
  }

  /** Set the calendar month and generate the dates. */
  incrementMonth(i: number): void {
    const newDate = new Date(this._calendar.value.setMonth(this._calendar.value.getMonth() + i));
    this._calendar.next(newDate);
  }

  /** Convert month integer to string value. */
  getMonthString(i: number): string {
    return month[i];
  }

  /** When user clicks on a date cell. */
  handleCellClick(cell: Cell): void {
    /** Reset if start date and end date is already selected. */
    if (this.selectedStartDate && this.selectedEndDate) {
      this.selectedStartDate = null;
      this.selectedEndDate = null;
    }

    /** If cell selected is before start date, set that as the new start date. */
    if (this.selectedStartDate && cell.value < this.selectedStartDate.getTime()) {
      this.selectedStartDate = new Date(cell.value);
      return;
    }

    /** If no start date, set as start date. Else set as end date. */
    if (!this.selectedStartDate) {
      this.selectedStartDate = new Date(cell.value);
    } else {
      this.selectedEndDate = new Date(cell.value);
    }
  }

  /** Add to the tasks pool. */
  addToTask(date: Date, task: Task): void {
    const monthYear = `${date.getMonth()}_${date.getFullYear()}`;
    this.tasks[monthYear] = this.tasks[monthYear] || {};
    this.tasks[monthYear][date.getDate()] = this.tasks[monthYear][date.getDate()] || [];
    this.tasks[monthYear][date.getDate()].push(task);
  }

  /** Return tasks associated to the specified date. */
  getTasks(cell: Cell): Task[] {
    const monthYear = `${cell.month}_${cell.year}`;
    if (!this.tasks[monthYear]) return [];
    return this.tasks[monthYear][cell.day] || [];
  }

  onSubmit(): void {
    if (!this.selectedStartDate || !this.selectedEndDate || this.selectedStartDate > this.selectedEndDate || !this.newTaskName) {
      return;
    }

    const task = { name: this.newTaskName };

    /** If start date == end date, only add 1 task. */
    if (this.selectedStartDate.getTime() === this.selectedEndDate.getTime()) {
      this.addToTask(this.selectedStartDate, task);
    } 
    /** Else, iterate through the dates and add a task to it. */
    else {
      const pointer = new Date(this.selectedStartDate);
      while (pointer.toDateString() !== this.selectedEndDate.toDateString()) {
        this.addToTask(pointer, task);
        pointer.setDate(pointer.getDate() + 1);
      }
      this.addToTask(pointer, task);
    }

    this.selectedStartDate = null;
    this.selectedEndDate = null;
  }

}
