const axios = require('axios');
const config = require('./config');

async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

  await axios.post(url, {
    chat_id: config.telegram.chatId,
    text: text
  });
}

module.exports = { sendMessage };