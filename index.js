const express = require('express');
const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.post('/voice', (request, response) => {
  const twiml = new VoiceResponse();

  console.log("request:", req)
  console.log("request.params:", req.params)

  // const gather = twiml.gather({
  //   numDigits: 1,
  // });

  if (request.RecordingUrl || request.params.RecordingUrl) {
    response.hangup();
  } else {
    record(response)
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

function record(response) {
  response.say({
    voice: 'woman',
    language: 'en-US'
  }, 'Let me record your dream');

  response.record({
      timeout: 10,
      transcribe: true
  });
}

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000/see-caller-count'));

