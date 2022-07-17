import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { AppComponent } from './app.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import {AppRoutingModule} from "./app-routing.module";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgSelectModule} from "@ng-select/ng-select";
import {FilterTickersPipe} from "./pipes/filter-tickers-pipe";

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FilterTickersPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    AppRoutingModule
  ],
  providers: [
    FilterTickersPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
