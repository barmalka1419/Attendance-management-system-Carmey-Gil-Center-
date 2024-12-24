export function speakText(text, language = 'he') {
  const synth = window.speechSynthesis;

  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = synth.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        synth.onvoiceschanged = () => {
          voices = synth.getVoices();
          resolve(voices);
        };
      }
    });
  };

  loadVoices().then((voices) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // התאמת השפה
    if (language === 'ar') {
      utterance.lang = 'ar-SA';
    } else if (language === 'en') {
      utterance.lang = 'en-US';
    } else if (language === 'ru') {
      utterance.lang = 'ru-RU'; 
    } else {
      utterance.lang = 'he-IL';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const voice = voices.find((v) => v.lang === utterance.lang && v.name.includes('Google'));
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`Voice for language ${language} not found. Using default voice.`);
    }

    synth.speak(utterance);
  });
}
