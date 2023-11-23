// crafts a query to send to the api
export function buildQuery(
  datasource: string,
  path: string,
  start: string,
  step: string,
  query: string,
  labelreplacer: string
): string {
  const startUnix = getStart(start);
  const Q = `/api/query?datasource=${datasource}&query=${encodeURIComponent(
    query
  )}&start=${startUnix}&step=${step}&path=${path}&cronus_label=${labelreplacer}`;
  return Q;
}

// builds a query to send to external datasource
export function buildExternalPrometheusQuery(
  path: string,
  raw_query: string,
  time: string,
  step: string
): string {
  const startUnix = getStart(time);
  const end = String(Math.floor(Date.now() / 1000));
  const Q = `${path}/api/v1/query_range?query=${raw_query}&start=${startUnix}&end=${end}&step=${step}`;
  return Q;
}

export function convertTimeToSteps(timeStr: string): number {
  const ONE_HOUR = 14;
  const ONE_DAY = ONE_HOUR * 24;
  let step = 1;
  if (timeStr === "15s") {
    step = 1;
  }
  if (timeStr === "30s") {
    step = 1;
  }
  if (timeStr === "1m") {
    step = 1;
  }
  if (timeStr === "5m") {
    step = 1;
  }
  if (timeStr === "10m") {
    step = 10 / 2;
  }
  if (timeStr === "30m") {
    step = 30 / 5;
  }
  if (timeStr === "1h") {
    step = ONE_HOUR;
  }
  if (timeStr === "2h") {
    step = ONE_HOUR * 2;
  }
  if (timeStr === "6h") {
    step = ONE_HOUR * 6;
  }
  if (timeStr === "12h") {
    step = ONE_HOUR * 12;
  }
  if (timeStr === "1d") {
    step = ONE_DAY;
  }
  if (timeStr === "1w") {
    step = ONE_DAY * 7;
  }
  if (timeStr === "1M") {
    step = ONE_DAY * 30;
  }
  return step;
}

function getStart(timeStr: string): Number {
  const ONE_MIN = 60;
  const ONE_HOUR = 60 * ONE_MIN;
  const ONE_DAY = 24 * ONE_HOUR;

  let minus = 0;
  if (timeStr === "15s") {
    minus = 15;
  }
  if (timeStr === "30s") {
    minus = 30;
  }
  if (timeStr === "1m") {
    minus = ONE_MIN;
  }
  if (timeStr === "5m") {
    minus = 5 * ONE_MIN;
  }
  if (timeStr === "10m") {
    minus = 10 * ONE_MIN;
  }
  if (timeStr === "30m") {
    minus = 30 * ONE_MIN;
  }
  if (timeStr === "1h") {
    minus = 1 * ONE_HOUR;
  }
  if (timeStr === "2h") {
    minus = 2 * ONE_HOUR;
  }
  if (timeStr === "6h") {
    minus = 6 * ONE_HOUR;
  }
  if (timeStr === "12h") {
    minus = 12 * ONE_HOUR;
  }
  if (timeStr === "1d") {
    minus = 1 * ONE_DAY;
  }
  if (timeStr === "1w") {
    minus = 7 * ONE_DAY;
  }
  if (timeStr === "1M") {
    minus = 30 * ONE_DAY;
  }

  const start = Math.floor(Date.now() / 1000) - minus;
  return start;
}
