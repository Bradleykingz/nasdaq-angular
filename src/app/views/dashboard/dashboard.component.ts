import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import * as dayjs from 'dayjs'
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

type Ticker = {
  ticker: string
}

type DataTable = {
  datatable: {
    data: any[][]
    columns: Column[]
  }
}

type Column = {
  name: string,
  type: string
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
  filteredTickers: Ticker[] = []

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.getTickerData()
    this.getDataForTicker(this.activeSVSTR, this.startDate, this.endDate)
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
  startDate: any = sessionStorage.getItem("startDate") ? dayjs(sessionStorage.getItem("startDate")) : dayjs(this.maxDate).subtract(1, 'month')

  endDate: any = sessionStorage.getItem("endDate") ? dayjs(sessionStorage.getItem("endDate")) : dayjs(this.maxDate)
  selectedDateRange: any = {startDate: this.startDate, endDate: this.endDate};

  activeSVSTR = this.route.snapshot.queryParams["ticker"] || sessionStorage.getItem('activeTicker') || "AAPL"

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
    sessionStorage.setItem('activeTicker', ticker)
    this.activeSVSTR = ticker
    this.getDataForTicker(ticker, this.selectedDateRange.startDate.toString(), this.selectedDateRange.endDate.toString())
  }


  getDataForTicker(ticker: string, startDate: string, endDate: string) {

    startDate = dayjs(startDate).format("YYYY-MM-DD")
    endDate = dayjs(endDate).format("YYYY-MM-DD")

    this.http.get<DataTable>(this.tickerDataURL, {
      params: {
        ticker,
        "date.gte": startDate,
        "date.lte": endDate
      }
    }).subscribe(response => {

        const datatable = response.datatable;
        const columns: Column[] = datatable.columns;

        const closeIndex = columns.findIndex(c => c.name === "close");
        const dateIndex = columns.findIndex(c => c.name === "date");

      this.lineChartData.labels = datatable.data.map((obj) => obj[dateIndex])
      this.lineChartData.datasets[0].data = datatable.data.map((obj) => obj[closeIndex]);
      this.lineChartData.datasets[0].label = ticker;

        this.chart?.chart?.update();
      }
    );
  }

  dateRangeChanged(event: any){
    let startDate = dayjs(event.startDate).format("YYYY-MM-DD")
    let endDate = dayjs(event.endDate).format("YYYY-MM-DD")

    if (!event.startDate && !event.endDate) {
      startDate = this.startDate;
      endDate = this.maxDate;
    } else {

      this.startDate = event.startDate
      this.endDate = event.endDate

      sessionStorage.setItem("startDate", startDate.toString());
      sessionStorage.setItem("endDate", endDate.toString());

      this.router.navigate([''], {
        queryParams: {
          ...this.route.snapshot.queryParams,
          startDate, endDate,
        }
      });

      this.getDataForTicker(this.activeSVSTR, startDate.toString(), endDate.toString())
    }
  }

}
