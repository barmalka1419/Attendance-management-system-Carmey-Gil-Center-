export function speakText(text, language = 'he') {
  const synth = window.speechSynthesis; // Access the browser's speech synthesis API.  Web Speech API

  // Function to load available voices
  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = synth.getVoices(); // Retrieve the list of available voices.

      if (voices.length > 0) {
        resolve(voices); // If voices are already loaded, resolve the promise.
      } else {
        // Wait for the voices to be loaded, in case they're not yet available.
        const handleVoicesChanged = () => {
          voices = synth.getVoices(); // Reload the voices after the event triggers.
          resolve(voices); // Resolve the promise with the loaded voices.
          synth.onvoiceschanged = null; // Clear the event listener to prevent it from firing again.
        };

        synth.onvoiceschanged = handleVoicesChanged; // Set an event listener for when voices are loaded.

        // Backup: Call getVoices again after a short delay, in case the event doesn't trigger.
        setTimeout(() => {
          voices = synth.getVoices(); // Attempt to load voices again.
          if (voices.length > 0) {
            resolve(voices); // Resolve the promise if voices are found.
            synth.onvoiceschanged = null; // Clear the event listener.
          }
        }, 500); // Wait for 500 milliseconds.
      }
    });
  };

  // Start the process of speaking the text
  loadVoices().then((voices) => {
    const utterance = new SpeechSynthesisUtterance(text); // Create a new speech synthesis utterance for the text.

    // Set the language of the utterance based on the provided language code.
    if (language === 'ar') {
      utterance.lang = 'ar-SA'; // Arabic
    } else if (language === 'en') {
      utterance.lang = 'en-US'; // English
    } else if (language === 'ru') {
      utterance.lang = 'ru-RU'; // Russian
    } else {
      utterance.lang = 'he-IL'; // Hebrew (default)
    }

    // Configure the voice parameters for pitch, rate, and volume.
    utterance.rate = 0.95; // Set the speed of the speech.
    utterance.pitch = 1.1; // Set the pitch of the speech.
    utterance.volume = 1; // Set the volume of the speech.

    // Find a high-quality voice for the selected language, preferring "Google" voices.
    const voice = voices.find((v) => v.lang === utterance.lang && v.name.includes('Google'));
    if (voice) {
      utterance.voice = voice; // Assign the found voice to the utterance.
    } else {
      console.warn(`Voice for language ${language} not found. Using default voice.`); // Log a warning if no suitable voice is found.
    }

    synth.speak(utterance); // Speak the utterance using the selected voice and settings.
  }).catch((error) => {
    console.error('Error loading voices or speaking text:', error); // Log any errors encountered during the process.
  });
}
