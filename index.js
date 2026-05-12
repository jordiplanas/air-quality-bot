require('dotenv').config();
const { getPM25Average } = require('./influx');
const { sendMessage } = require('./telegram');
const config = require('./config');

async function run() {
  try {
    const pm25 = await getPM25Average();

    if (!pm25) {
      console.log("No data");
      return;
    }

    console.log("PM2.5 media 10min:", pm25);

    let message = null;

    if (pm25 > config.alert.critical) {
      message = `
🚨 Contaminación MUY alta

PM2.5 (media 10 min): ${pm25.toFixed(1)} µg/m³

⛔ Evita salir o hacer ejercicio
`;
    }
    else if (pm25 > config.alert.danger) {
      message = `
⚠️ Contaminación alta

PM2.5 (media 10 min): ${pm25.toFixed(1)} µg/m³

⚠️ Evita actividad intensa
`;
    }
    else if (pm25 > config.alert.warning) {
      message = `
🟡 Calidad del aire mejorable

PM2.5: ${pm25.toFixed(1)} µg/m³
`;
    }

    if (message) {
      await sendMessage(message);
      console.log("Mensaje enviado ✅");
    } else {
      console.log("Todo OK 🌿");
    }

  } catch (err) {
    console.error(err);
  }
}

run();