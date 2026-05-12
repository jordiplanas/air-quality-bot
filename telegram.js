const axios = require('axios');
const config = require('./config');

async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

  try {
    const res = await axios.post(url, {
      chat_id: config.telegram.chatId,
      text: text
    }, { timeout: 10000 });
    return res.data;
  } catch (err) {
    if (err.response) {
      throw new Error(`Telegram API error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

module.exports = { sendMessage };