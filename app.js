/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

let slots = [];

("use strict");

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server
const sendDateMessage = require("./utils/send_date_message");
const sendSlots = require("./utils/send_slots_message");
const sendSlotConfirm = require("./utils/send_slot_confirm");
const sendTommorrowConfirmedMessage = require("./utils/send_tommrow_confirmed_slot");
const bookTomorrowSlot = require("./utils/book_tommorrow_slot");
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", async (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log("Request Body", body);

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2));

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.contacts[0].wa_id;
      let from = req.body.entry[0].changes[0].value.contacts[0].profile.name; // extract the phone number from the webhook payload
      let message_type = req.body.entry[0].changes[0].value.messages[0].type;
      let button_message =
        req.body.entry[0].changes[0].value.messages[0].button.payload; // extract the message text from the webhook payload
      if (message_type === "button" && button_message === "Confirm") {
        console.log(await sendDateMessage(phone_number_id));
      }

      if (message_type === "button" && button_message === "Tommorrow") {
        let this_hour = new Date().getHours();
        if (this_hour > 8 || this_hour <= 12) {
          console.log(await bookTomorrowSlot(phone, "8am-12pm"));
        } else if (this_hour > 12 || this_hour < 16) {
          console.log(await bookTomorrowSlot(phone, "12pm-4pm"));
        } else if (this_hour > 16 || this_hour < 20) {
          console.log(await bookTomorrowSlot(phone, "4pm-8pm"));
        } else {
          await bookTomorrowSlot(phone, "8am-12pm");
        }
      } else if (message_type === "button" && button_message === "Today") {
        console.log(await sendSlots(phone_number_id));
      } else if (
        message_type === "button" &&
        (button_message === "8am-12pm" ||
          button_message == "12-4pm" ||
          button_message == "4-8pm")
      ) {
        const current_hour = new Date().getHours();
        console.log("Current Hour", current_hour);
        if (current_hour > 11 && button_message === "8am-12pm") {
          console.log(
            await sendTommorrowConfirmedMessage(phone_number_id, "8am-12pm")
          );
        } else if (current_hour > 15 && button_message === "12-4pm") {
          console.log(
            await sendTommorrowConfirmedMessage(phone_number_id, "12-4pm")
          );
        } else if (current_hour > 19 && button_message === "4-8pm") {
          console.log(
            await sendTommorrowConfirmedMessage(phone_number_id, "4-8pm")
          );
        } else {
          console.log(
            await sendSlotConfirm(phone_number_id, from, button_message)
          );
        }
      }
    }
    res.sendStatus(200);
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});
