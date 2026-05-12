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

    console.log("PM2.5 mitjana dels darrers 10 min:", pm25);

    let message = null;

    if (pm25 > config.alert.critical) {
      message = `
🚨 Contaminació MOLT alta

PM2.5 (mitjana dels darrers 10 min): ${pm25.toFixed(1)} µg/m³

⛔ Evita sortir o fer exercici
`;
    }
    else if (pm25 > config.alert.danger) {
      message = `
⚠️ Contaminació alta

PM2.5 (mitjana dels darrers 10 min): ${pm25.toFixed(1)} µg/m³

⚠️ Evita activitat intensa
`;
    }
    else if (pm25 > config.alert.warning) {
      message = `
🟡 Qualitat de l'aire millorable

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