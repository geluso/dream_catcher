const express = require('express');
const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

const URLS = ["http://example.com"]

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.get('/', (request, response) => {
  let html = "<div>"
  for (let url of URLS) {
    html += "<p><a href='" + url + "'>" + url + "</a></p>"
  } 
  html += "</div>"
  response.send(html)
})

app.post('/voice', (request, response) => {
  const twiml = new VoiceResponse();

  console.log("request:", request)
  console.log("request.params:", request.params)

  const recordingUrl = request.body.RecordingUrl
  if (recordingUrl) {
    URLS.push(recordingUrl)
    twiml.hangup();
  } else {
    record(twiml)
  }

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

function record(twiml) {
  twiml.say({
    voice: 'woman',
    language: 'en-US'
  }, 'Let me record your dream');

  twiml.record({
      timeout: 10,
      transcribe: true
  });
}

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000/'));

