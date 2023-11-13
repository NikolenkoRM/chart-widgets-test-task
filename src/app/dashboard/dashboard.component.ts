import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ChartService } from '../chart/chart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  public readonly maxCharts: number = 4;
  public range!: FormGroup;
  public maxDate: Date = new Date();
  public counter: number = 1;
  public chartIds: string[] = [`chart-${this.counter}`];

  constructor(private chartService: ChartService) {}

  public ngOnInit(): void {
    const dateTenDaysBefore = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const now = new Date();

    this.range = new FormGroup({
      start: new FormControl<Date | null>(dateTenDaysBefore),
      end: new FormControl<Date | null>(now),
    });

    this.chartService.getSensorsData(this.range.value);

    this.range
      .get('start')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((date: Date) => {
        const ninetyDaysFromStartDate = new Date(
          date.getTime() + 90 * 24 * 60 * 60 * 1000
        );

        this.maxDate =
          new Date().getTime() > ninetyDaysFromStartDate.getTime()
            ? ninetyDaysFromStartDate
            : new Date();
      });

    this.range.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((range) => this.chartService.getSensorsData(range));
  }

  public addChart(): void {
    if (this.chartIds.length < this.maxCharts) {
      this.chartIds.push(`chart-${++this.counter}`);
    }
  }

  public removeChart(i: number): void {
    this.chartIds.splice(i, 1);
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
