const express = require('express');
const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

const URLS = []

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

  console.log("request.body:", request.body)

  handle(request, response, twiml)

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

function handle(request, respoonse, twiml) {
  const digit = request.body.Digits
  const recordingUrl = request.body.RecordingUrl

  if (digit == 5) {
    // cancel recording
    return
  }

  if (recordingUrl) {
    finishRecording(recordingUrl)
    URLS.push(recordingUrl)
    return
  }

  if (digit == 1) {
    record(twiml)
    return
  }

  mainMenu(twiml)
}

function mainMenu(twiml) {
  twiml.say({
    voice: 'woman',
    language: 'en-US'
  }, 'Wait to hear a dream or press 1 to record and share your own');

  twiml.gather({
    numDigits: 1,
  })

  twiml.pause({
      length: 1
  })

  if (URLS.length === 0) {
    twiml.say({
      voice: 'woman',
      language: 'en-US'
    }, 'Sorry. I haven\'t heard a dream yet. Sleep well.')
    return
  }

  // pick and play a random dream
  const index = Math.floor(Math.random() * URLS.length)
  const randomDreamUrl = URLS[index]
  twiml.play({
    loop: 1
  }, randomDreamUrl);

  twiml.pause({
      length: 1
  })

  twiml.say({
    voice: 'woman',
    language: 'en-US'
  }, 'Goodnight');
}

function record(twiml) {
    twiml.say({
      voice: 'woman',
      language: 'en-US'
    }, 'press 5 to cancel or any key to save and share');

    twiml.record({
        timeout: 3,
        transcribe: true
    });
}

function finishRecording(recordingUrl) {
    URLS.push(recordingUrl)

    twiml.say({
      voice: 'woman',
      language: 'en-US'
    }, 'Dream saved. Goodnight');

    twiml.hangup()

    return
}

let port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:3000/'));

