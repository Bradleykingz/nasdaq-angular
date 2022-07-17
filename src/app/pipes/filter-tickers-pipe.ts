import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "tickerFilter"})
export class FilterTickersPipe implements PipeTransform {

  transform(tickers: { ticker: string }[], filterText: string): any {

    if (!tickers) return []

    if (!filterText) return tickers

    return tickers.filter(t => {
      return t.ticker.toLowerCase().startsWith(filterText) || t.ticker.toLowerCase().includes(filterText)
    })
  }

}
