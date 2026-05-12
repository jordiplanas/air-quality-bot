require('dotenv').config();
const { sendMessage } = require('./telegram');
const config = require('./config');

const pm25 = parseFloat(process.argv[2]);

if (isNaN(pm25)) {
  console.error('Usage: node test.js <pm25_value>');
  console.error('Example: node test.js 60');
  process.exit(1);
}

console.log('PM2.5 simulado:', pm25);

let message = null;

if (pm25 > config.alert.critical) {
  message = `
🚨 Contaminación MUY alta

PM2.5 (media 10 min): ${pm25.toFixed(1)} µg/m³

⛔ Evita salir o hacer ejercicio
`;
} else if (pm25 > config.alert.danger) {
  message = `
⚠️ Contaminación alta

PM2.5 (media 10 min): ${pm25.toFixed(1)} µg/m³

⚠️ Evita actividad intensa
`;
} else if (pm25 > config.alert.warning) {
  message = `
🟡 Calidad del aire mejorable

PM2.5: ${pm25.toFixed(1)} µg/m³
`;
}

if (message) {
  sendMessage(message)
    .then(() => console.log('Mensaje enviado ✅'))
    .catch(err => console.error('Error enviando mensaje:', err.message));
} else {
  console.log('Todo OK 🌿 (sin alerta, no se envía mensaje)');
}
