import { Component, ViewChild, OnInit } from '@angular/core';
import {Chart, ChartConfiguration, ChartEvent, ChartType, Tick} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as dayjs from 'dayjs'

import {default as Annotation} from 'chartjs-plugin-annotation';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

type Ticker = {
  ticker: string
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private tickerDataURL = `https://nasdaq-angular.pages.dev/api/prices`;
  private tickerURL = "https://nasdaq-angular.pages.dev/api/tickers"

  tickers: Ticker[] = []

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.getTickerData()
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Series A',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      },
    ],
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July']
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},
      'y-axis-0':
        {
          position: 'left',
        },
    },

    plugins: {
      legend: {
        display: false,
      },
    }
  };

  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  maxDate: any = dayjs("2018-04-11")
  defaultStartDate: any = dayjs(localStorage.getItem("startDate")) || dayjs(this.maxDate).subtract(1, 'month')
  selectedDateRange: any = {startDate: this.defaultStartDate, endDate: dayjs(localStorage.getItem("endDate")) || this.maxDate};

  activeSVSTR = "AAPL"

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  }

  getTickerData() {
    this.http.get<Ticker[]>(this.tickerURL).subscribe(data => this.tickers = data)
  }

  switchActiveSVSTR(ticker: string) {
    this.router.navigate([''], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        ticker: ticker
      }
    });
    this.activeSVSTR = ticker
    this.getDataForTicker(ticker)
  }


  getDataForTicker(ticker: string) {

  }

  dateRangeChanged(event: any){
    let startDate = dayjs(event.startDate).format("YYYY-MM-DD")
    let endDate = dayjs(event.endDate).format("YYYY-MM-DD")

    if (!event.startDate && !event.endDate) {
      startDate = this.defaultStartDate;
      endDate = this.maxDate;
    } else {
      localStorage.setItem("startDate", startDate.toString());
      localStorage.setItem("endDate", endDate.toString());

      this.router.navigate([''], {
        queryParams: {
          ...this.route.snapshot.queryParams,
          startDate, endDate,
        }
      });

    }
  }

}
