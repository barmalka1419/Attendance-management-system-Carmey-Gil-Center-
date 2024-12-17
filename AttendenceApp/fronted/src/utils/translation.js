export async function translateText(text, targetLang = null) {
    const language = targetLang || localStorage.getItem('selectedLanguage') || 'he';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Error translating text:', error);
      return text; // במקרה של שגיאה, החזר את הטקסט המקורי
    }
  }
  