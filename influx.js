const { InfluxDB } = require('@influxdata/influxdb-client');
const config = require('./config');

const influxDB = new InfluxDB({
  url: config.influx.url,
  token: config.influx.token
});

const queryApi = influxDB.getQueryApi(config.influx.org);

async function getPM25Average() {
  const fluxQuery = `
    from(bucket: "${config.influx.bucket}")
      |> range(start: -10m)
      |> filter(fn: (r) => r._measurement == "air_quality")
      |> filter(fn: (r) => r._field == "pm25")
      |> mean()
  `;

  return new Promise((resolve, reject) => {
    let value = null;

    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        value = o._value;
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(value);
      }
    });
  });
}

module.exports = { getPM25Average };