require('dotenv').config();
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const config = require('./config');

const client = new InfluxDB({ url: config.influx.url, token: config.influx.token });

const args = process.argv.slice(2);
const writeValue = args[0] === '--write' ? parseFloat(args[1]) : null;

async function testRead() {
  const queryApi = client.getQueryApi(config.influx.org);
  const query = `
    from(bucket: "${config.influx.bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "ESP32_weather_station")
      |> filter(fn: (r) => r._field == "PM 25")
      |> last()
  `;

  return new Promise((resolve, reject) => {
    let found = false;
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        console.log(`✅ Lectura encontrada: pm25 = ${o._value} µg/m³ (${o._time})`);
        found = true;
      },
      error: reject,
      complete() {
        if (!found) console.log('⚠️  Conexión OK pero no hay datos en la última hora.');
        resolve();
      }
    });
  });
}

async function testWrite(value) {
  const writeApi = client.getWriteApi(config.influx.org, config.influx.bucket, 'ns');
  const point = new Point('ESP32_weather_station').floatField('PM 25', value);
  writeApi.writePoint(point);
  await writeApi.close();
  console.log(`✅ Dato escrito: pm25 = ${value} µg/m³`);
}

async function run() {
  console.log('Conectando a InfluxDB...');
  console.log(`  URL: ${config.influx.url}`);
  console.log(`  Org: ${config.influx.org}`);
  console.log(`  Bucket: ${config.influx.bucket}\n`);

  try {
    if (writeValue !== null) {
      if (isNaN(writeValue)) {
        console.error('Uso: node test-influx.js --write <valor>');
        process.exit(1);
      }
      await testWrite(writeValue);
    }
    await testRead();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
