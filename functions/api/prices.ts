import {CFContext} from "./tickers";

export async function onRequest(context: CFContext) {
  const nasdaqAPIKey = "ibdbaFnCTjN1-cX_xjz2"

  const tickerDataURL = `https://data.nasdaq.com/api/v3/datatables/WIKI/PRICES/?api_key=${nasdaqAPIKey}`;

  const responseData = await fetch(tickerDataURL)
  const tickerDataJSON = await responseData.json()

  return new Response(JSON.stringify(tickerDataJSON));
}
