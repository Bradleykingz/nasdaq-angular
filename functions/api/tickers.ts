type CFContext = {
  request: Request,
  env: any,
  params: any,
  waitUntil: any,
  next: any,
  data: any
}

function csvToJSON(csv: string){

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


export async function onRequest(context: CFContext) {

  const nasdaqAPIKey = "ibdbaFnCTjN1-cX_xjz2"
  const tickerDataURL = `https://data.nasdaq.com/api/v3/datatables/WIKI/PRICES/?api_key=${nasdaqAPIKey}`;
  const tickerURL= "https://static.quandl.com/coverage/WIKI_PRICES.csv"

  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const tickerData = await fetch(tickerURL, {
    headers: {
      "Content-Type": "text/plain"
    }
  })
  const tickerDataJSON = csvToJSON(await tickerData.text())


  return new Response("Hello World!");
}
