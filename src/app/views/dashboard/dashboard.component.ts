import { Component, ViewChild, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import {default as Annotation} from 'chartjs-plugin-annotation';
import {NgxPopperjsPlacements, NgxPopperjsTriggers} from "ngx-popperjs";
import {HttpClient} from "@angular/common/http";

type Ticker = {

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  nasdaqAPIKey = "ibdbaFnCTjN1-cX_xjz2"
  private tickerDataURL = `https://data.nasdaq.com/api/v3/datatables/WIKI/PRICES/?api_key=${this.nasdaqAPIKey}`;
  private tickerURL= "https://static.quandl.com/coverage/WIKI_PRICES.csv"

  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.getTickerData()
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [ 65, 59, 80, 81, 56, 55, 40 ],
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
    labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July' ]
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
  dateRangeDropdownPlacement = NgxPopperjsPlacements.BOTTOM;
  dateRangeDropdownTrigger = NgxPopperjsTriggers.click;
  selectedDateRange: any = {start: "10/10/10", end: "10/10/20"};

  getTickerData() {
    this.http.get<string[]>(this.tickerURL, {
      // @ts-ignore
      responseType: "text"
    }).subscribe(data => {
      console.log(data);
    })
  }

  getDataForTicker(ticker: string) {

  }

  private csvToJSON(csv: string){

    const lines = csv.split("\n");

    const result = [];
    const headers=lines[0].split(",");

    for(let i=1; i<lines.length; i++){

      const obj = {};
      const currentline = lines[i].split(",");

      for(let j=0; j<headers.length; j++){
        // @ts-ignore
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
  }

}
