import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ReplaySubject, takeUntil } from 'rxjs';
import { chartColors } from '../shared/chart-colors';
import { chartTypes } from '../shared/chart-types';
import { SensorType, sensors } from '../shared/sensors';
import { ChartService } from './chart.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  private destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  @Input() public chartId!: string;
  @Input() public dateRange!: DateRange<Date>;

  public chart!: Chart;
  public chartForm: FormGroup;
  public readonly sensors = sensors;
  public readonly chartTypes = chartTypes;
  public readonly chartColors = chartColors;

  constructor(private chartService: ChartService) {
    Chart.register(...registerables, zoomPlugin);
    this.chartForm = new FormGroup({
      datePeriod: new FormControl(null),
      sensors: new FormControl([this.sensors[0].toLowerCase()]),
      type: new FormControl(this.chartTypes[0].toLowerCase()),
      color: new FormControl(this.chartColors[0].hex),
    });
  }

  public ngOnInit(): void {
    this.chartForm
      .get('type')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.redrawChart());

    this.chartForm
      .get('sensors')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.redrawChart());

    this.chartForm
      .get('color')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((color) => {
        this.chart.options.backgroundColor = color;
        this.chart.options.borderColor = color;
        this.chart.update();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.redrawChart();
    }
  }

  public ngAfterViewInit(): void {
    this.chart = this.getChart();
  }

  private redrawChart(): void {
    this.chart.destroy();
    this.chart = this.getChart();
  }

  private getChart(): Chart {
    const sensors: SensorType[] = this.chartForm.get('sensors')?.value;
    const type: ChartType = this.chartForm.get('type')?.value;
    const color: string = this.chartForm.get('color')?.value;

    const config = this.chartService.getChartConfig(sensors);

    if (config.options) {
      config.options.backgroundColor = color;
      config.options.borderColor = color;
    }

    return new Chart(this.chartId, { ...config, type } as ChartConfiguration);
  }

  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
