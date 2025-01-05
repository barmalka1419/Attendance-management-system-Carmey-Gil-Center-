// Function to translate text to a specified target language using the Google Translate API
export async function translateText(text, targetLang = null) {
  // Determine the target language:
  // If `targetLang` is provided, use it.
  // Otherwise, check for a language stored in localStorage under the key 'selectedLanguage'.
  // If no language is set, default to Hebrew ('he').
  const language = targetLang || localStorage.getItem('selectedLanguage') || 'he';

  // Construct the URL for the Google Translate API request
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language}&dt=t&q=${encodeURIComponent(
    text // Encode the text to ensure special characters do not break the URL
  )}`;

  try {
    // Send a GET request to the constructed URL
    const response = await fetch(url);

    // Parse the response into JSON format
    const data = await response.json();

    // Extract and return the translated text from the API response
    return data[0][0][0];
  } catch (error) {
    // Log an error message to the console in case of a failure
    console.error('Error translating text:', error);

    // Return the original text (untranslated) as a fallback
    return text; 
  }
}
