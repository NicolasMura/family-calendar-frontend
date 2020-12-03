import { Day } from './day.model';

export class Week {
  weekNumber: number;
  days: Day[];

  constructor(weekNumber: number, days: Day[]) {
    this.weekNumber = weekNumber;
    this.days = days;
  }
}
