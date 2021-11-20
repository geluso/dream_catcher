const express = require('express');
const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const fetch = require('node-fetch')

const app = express();

let URLS = []
refreshUrls()

function refreshUrls() {
  console.log("refreshing urls")
  fetch("https://5tephen.com/dreamcatcher/")
  .then(res => res.text())
  .then(body => {
    URLS = body.trim().split("\n")
    console.log(URLS)
  });
}

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
  refreshUrls()

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
    twiml.say({
      voice: 'woman',
      language: 'en-US'
    }, 'Poof. I forgot your dream. Yawn');
    return
  }

  if (recordingUrl) {
    finishRecording(twiml, recordingUrl)
    URLS.push(recordingUrl)
    return
  }

  if (digit == 1) {
    hearDream(twiml)
    return
  }

  if (digit == 2) {
    record(twiml)
    return
  }

  mainMenu(twiml)
}

function mainMenu(twiml) {
  twiml.say({
    voice: 'woman',
    language: 'en-US'
  }, 'press 1 to hear a dream or press 2 to record and share your own');

  twiml.gather({
    numDigits: 1,
  })

  twiml.pause({
      length: 1
  })

  hearDream(twiml)
}

function hearDream(twiml) {
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

function finishRecording(twiml, recordingUrl) {
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

