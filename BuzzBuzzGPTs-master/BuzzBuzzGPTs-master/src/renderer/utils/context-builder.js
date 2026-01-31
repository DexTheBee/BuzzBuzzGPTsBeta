/**
 * AI Context Message Builder
 * Formats user preferences into a context message for the AI
 */

/**
 * Build a context message from language preferences
 * @param {string} outputLang - The chosen output language code (e.g., 'en', 'es')
 * @param {string} codeLang - The chosen code language name (e.g., 'python', 'javascript')
 * @returns {string} The formatted context message
 */
function buildContextMessage(outputLang, codeLang) {
    const languages = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        zh: 'Chinese',
        ja: 'Japanese'
    };

    const outputLangName = languages[outputLang] || 'English';

    // Format the code language nicely (capitalize first letter)
    const codeLangName = codeLang.charAt(0).toUpperCase() + codeLang.slice(1);

    return `I'm currently working on a ${codeLangName} problem. Please provide all explanations and responses in ${outputLangName}.`;
}

module.exports = { buildContextMessage };
