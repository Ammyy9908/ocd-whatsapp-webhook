const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

async function sendDateMessage(phone) {
  const token = process.env.WHATSAPP_TOKEN;
  try {
    const r = await axios.post(
      `https://graph.facebook.com/v15.0/107625022002368/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: { name: "consignment_date", language: { code: "en_US" } },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(r.data);
    return r.data;
  } catch (e) {
    console.log(e);
  }
}

module.exports = sendDateMessage;
