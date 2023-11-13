import { Injectable } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { chartLimits } from '../shared/chart-limits';
import { SensorType, sensors } from '../shared/sensors';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  public sensorsData: {
    dates: Date[];
    sensors: Record<SensorType, number[]>;
  } = {
    dates: [],
    sensors: { temperature: [], humidity: [], light: [] },
  };

  constructor() {}

  public getChartConfig(sensors: SensorType[]): Partial<ChartConfiguration> {
    const dates = this.sensorsData.dates;
    const datasets = sensors.map((sensor) => ({
      data: this.sensorsData.sensors[sensor],
      label: sensor,
      tension: 0.1,
    }));

    const data: ChartData = {
      labels: dates?.map((date) => date.toLocaleDateString()),
      datasets,
    };

    const options: ChartOptions = this.getChartOptions(
      dates.length,
      Math.max(...datasets.map((dataset) => dataset.data).flat())
    );

    return { data, options };
  }

  private getChartOptions(maxX: number, maxY: number): ChartOptions {
    return {
      plugins: {
        zoom: {
          limits: {
            x: { min: 0, max: maxX, minRange: 1 },
            y: {
              min: 0,
              max: maxY,
              minRange: 1,
            },
          },
          pan: { enabled: true },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.01,
            },
            pinch: {
              enabled: true,
            },
            mode: 'xy',
            onZoomComplete({ chart }) {
              chart.update('none');
            },
          },
        },
      },
    };
  }

  private getChartDataset(sensor: SensorType, count: number): number[] {
    switch (sensor) {
      case 'temperature':
        return this.getTemperatures(count);

      case 'humidity':
        return this.getHumidity(count);

      case 'light':
        return this.getLight(count);

      default:
        return [];
    }
  }

  private getRangeDates(range: DateRange<Date>): Date[] {
    const dates = [];

    if (range.start && range.end) {
      const currentDate = new Date(range.start.getTime());
      while (currentDate <= range.end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return dates;
  }

  public getSensorsData(range: DateRange<Date>): void {
    const dates = this.getRangeDates(range);
    this.sensorsData.dates = dates;

    sensors.forEach((sensor) => {
      this.sensorsData.sensors[sensor] = this.getChartDataset(
        sensor,
        dates.length
      );
    });
  }

  private getTemperatures(count: number): number[] {
    return this.random(
      chartLimits.temperature.min,
      chartLimits.temperature.max,
      count
    );
  }

  private getHumidity(count: number): number[] {
    return this.random(
      chartLimits.humidity.min,
      chartLimits.humidity.max,
      count
    );
  }

  private getLight(count: number): number[] {
    return this.random(chartLimits.light.min, chartLimits.light.max, count);
  }

  private random(min: number, max: number, count: number): number[] {
    return Array.from({ length: count }, () =>
      Math.floor(Math.random() * (max - min) + min)
    );
  }
}
