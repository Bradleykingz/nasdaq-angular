import {Component, OnInit, ViewChild} from '@angular/core';
import {ChartConfiguration, ChartData, ChartType} from 'chart.js';
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

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.getTickerData()

    this.getDataForTicker(this.activeTicker, this.formattedStartDate, this.formattedEndDate)

    const hasParamsTicker = this.route.snapshot.queryParams["ticker"] != null
    const hasParamsStartDate = this.route.snapshot.queryParams["startDate"] != null
    const hasParamsEndDate = this.route.snapshot.queryParams["endDate"] != null

    if (!hasParamsTicker || !hasParamsStartDate || hasParamsEndDate) {
      this.router.navigate([''], {
        queryParams: {
          ...this.route.snapshot.queryParams,
          ...(!hasParamsTicker && {
            ticker: this.activeTicker
          }),
          ...(!hasParamsStartDate && {
            startDate: this.formattedStartDate
          }),
          ...(!hasParamsEndDate && {
            endDate: this.formattedEndDate
          })
        }
      })
    }

  }

  public lineChartData: ChartData = {
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      },
    ],
    labels: [],
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
      tooltip: {
        callbacks: {
          label(tooltipItem): string | string[] {
            let label = tooltipItem.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (tooltipItem.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tooltipItem.parsed.y);
            }
            return label;
          }
        }
      },
      legend: {
        display: false,
      },
    }
  };

  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private sessionStorageStartDate = sessionStorage.getItem('startDate')
  private sessionStorageEndDate = sessionStorage.getItem('endDate')

  maxDate: dayjs.Dayjs = dayjs("2018-04-11")
  defaultStartDate: dayjs.Dayjs = dayjs(this.maxDate).subtract(1, 'month')

  startDate: dayjs.Dayjs = this.sessionStorageStartDate ? dayjs(this.sessionStorageStartDate) : this.defaultStartDate
  formattedStartDate = this.startDate.format('YYYY-MM-DD')

  endDate: dayjs.Dayjs = this.sessionStorageEndDate ? dayjs(this.sessionStorageEndDate) : dayjs(this.maxDate)
  formattedEndDate = this.endDate.format('YYYY-MM-DD')

  selectedDateRange: { endDate: dayjs.Dayjs; startDate: dayjs.Dayjs } = {
    startDate: this.startDate,
    endDate: this.endDate
  };

  activeTicker = this.route.snapshot.queryParams["ticker"] || sessionStorage.getItem('activeTicker') || "AAPL"

  selectedClosingOption: number = 1;

  closingOptions = [
    { id: 1, name: 'Closing Price' },
    { id: 2, name: 'Adj. Closing Price' },
  ];

  table: DataTable = {
    datatable: {
      data: [],
      columns: []
    }
  }

  searchInputModel: string = ""

  getTickerData() {
    this.http.get<Ticker[]>(this.tickerURL).subscribe(data => this.tickers = data)
  }

  switchActiveTicker(ticker: string) {
    this.router.navigate([''], {
      queryParams: {
        ...this.route.snapshot.queryParams,
        ticker: ticker
      }
    });
    sessionStorage.setItem('activeTicker', ticker)
    this.activeTicker = ticker
    this.getDataForTicker(ticker)
  }


  getDataForTicker(ticker: string, startDate?: string, endDate?: string) {

    this.http.get<DataTable>(this.tickerDataURL, {
      params: {
        ticker,
        "date.gte": startDate || this.formattedStartDate,
        "date.lte": endDate || this.formattedEndDate,
      }
    }).subscribe(response => {
        this.table = response

        this.updateChartDataWithKey("close");
        this.lineChartData.labels = this.getDataWithKey("date").map(d => dayjs(d).format("DD/MM/YY"))
        this.lineChartData.datasets[0].label = ticker;

        this.chart?.chart?.update();
      }
    );
  }

  dateRangeChanged(event: any){

    if (event.startDate && event.endDate) {

      let startDate = dayjs(event.startDate)
      let endDate = dayjs(event.endDate)

      this.startDate = startDate
      this.endDate = endDate

      let formattedStartDate = startDate.format('YYYY-MM-DD')
      let formattedEndDate = endDate.format('YYYY-MM-DD');

      sessionStorage.setItem("startDate", formattedStartDate);
      sessionStorage.setItem("endDate", formattedEndDate);

      this.router.navigate([''], {
        queryParams: {
          ...this.route.snapshot.queryParams,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }
      });

      this.getDataForTicker(this.activeTicker, formattedStartDate, formattedEndDate)
    }
  }

  updateChartDataWithKey(key: string){
    this.lineChartData.datasets[0].data = this.getDataWithKey(key);
    this.chart?.chart?.update();
  }

  getDataWithKey(key: string){
    return this.table.datatable.data.map((obj) => obj[this.table.datatable.columns.findIndex(c => c.name === key)])
  }

  onClosingOptionChanged(event: any){
    switch (event.id){
      case 1:
        this.updateChartDataWithKey("close")
        break;
      case 2:
        this.updateChartDataWithKey("adj_close")
        break;
        default:
          break;
    }
  }

}
