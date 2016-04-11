// a tiny wrapper around
// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance

/*
  SpeechSynthesisVoice
  {
    voiceURI: "Anna",
    name: "Anna",
    lang: "de-DE",
    localService: true,
    default: false
  }
*/

let voices = {};

function getVoice(voiceURI, voices) {
    if(voices[voiceURI]) { return voices[voiceURI]; }

    let clientVoices = window.speechSynthesis.getVoices();

    clientVoices.forEach((voice) => {
      // console.log(voice.voiceURI);
      voices[voice.voiceURI] = voice;
    });

    return voices[voiceURI];
  }

export default function speak(text, opts, handlers) {
  try {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    opts = opts || {};
    Object.keys(opts).forEach((opt) => {
      utterance[opt] = (opt === 'voice') ? getVoice(opts[opt], voices) : opts[opt];
    });

    Object.keys(handlers).forEach((evt) => {
      const evtFn = handlers[evt];
      utterance.addEventListener(evt, evtFn);
    });

    console.log(utterance);  //stupid hack to get events to work in chrome.
    window.speechSynthesis.speak(utterance);
  }
  catch(e) {
    return false;
  }

  return true;
}
