/* words.js — shared number-word dictionaries for the Number Hero games.
 * Extracted verbatim from index.html so counting.html / addition.html speak
 * the same three languages. Plain script (no modules): include with
 * <script src="words.js"></script> BEFORE any inline script that uses it. */

// English: Generated via logic
function getEnglishWord(n) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (n === 100) return "One Hundred";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
}

// Spanish: Generated via logic
function getSpanishWord(n) {
    const ones = ["", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve"];
    const teens = ["Diez", "Once", "Doce", "Trece", "Catorce", "Quince", "Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve"];
    const twenties = ["Veinte", "Veintiuno", "Veintidós", "Veintitrés", "Veinticuatro", "Veinticinco", "Veintiséis", "Veintisiete", "Veintiocho", "Veintinueve"];
    const tens = ["", "", "", "Treinta", "Cuarenta", "Cincuenta", "Sesenta", "Setenta", "Ochenta", "Noventa"];

    if (n === 100) return "Cien";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 30) return twenties[n - 20];

    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o > 0 ? " y " + ones[o].toLowerCase() : "");
}

// Hindi: Using exact phonetics array due to complex irregularities
const hindiWords = [
    "", "Ek", "Do", "Teen", "Chaar", "Paanch", "Chhah", "Saat", "Aath", "Nau", "Das",
    "Gyaarah", "Baarah", "Terah", "Chaudah", "Pandrah", "Solah", "Satrah", "Athaarah", "Unnees", "Bees",
    "Ikkees", "Baaees", "Te-ees", "Chaubees", "Pachees", "Chhabees", "Sattaees", "Athaees", "Untees", "Tees",
    "Ikattees", "Battees", "Taintees", "Chauntees", "Paintees", "Chhattees", "Saintees", "Adtees", "Untaalees", "Chaalees",
    "Iktaalees", "Bayaalees", "Taitaalees", "Chauvaalees", "Paintaalees", "Chhiyaalees", "Saintaalees", "Adtaalees", "Unchaas", "Pachaas",
    "Ikyaavan", "Baavan", "Tirpan", "Chauvan", "Pachpan", "Chhappan", "Sattaavan", "Athaavan", "Unsath", "Saath",
    "Iksath", "Baasath", "Tirsath", "Chausath", "Painsath", "Chhiyasath", "Sarsath", "Adasath", "Unhattar", "Sattar",
    "Ikhattar", "Bahattar", "Tihattar", "Chauhattar", "Pachhattar", "Chhihattar", "Satahattar", "Athahattar", "Unnaasee", "Assee",
    "Ikyaasee", "Bayaasee", "Tiraasee", "Chauraasee", "Pachaasee", "Chhiyaasee", "Sattaasee", "Athaasee", "Navaasee", "Nabbe",
    "Ikyaanave", "Baanave", "Tiraanave", "Chauraanave", "Pachaanave", "Chhiyaanave", "Sattaanave", "Athaanave", "Ninyaanave", "Sau"
];

function getHindiWord(n) {
    return hindiWords[n];
}

function getTranslation(num, lang) {
    if (lang === 'en') return getEnglishWord(num);
    if (lang === 'es') return getSpanishWord(num);
    if (lang === 'hi') return getHindiWord(num);
}

function getLanguageName(lang) {
    if (lang === 'en') return 'English';
    if (lang === 'es') return 'Español';
    if (lang === 'hi') return 'Hindi';
}

// Spoken form of a simple addition equation, per language.
function getAdditionSpeech(a, b, lang) {
    if (lang === 'es') return getSpanishWord(a) + " más " + getSpanishWord(b);
    if (lang === 'hi') return getHindiWord(a) + " aur " + getHindiWord(b);
    return getEnglishWord(a) + " plus " + getEnglishWord(b);
}

function getSubtractionSpeech(a, b, lang) {
    if (lang === 'es') return getSpanishWord(a) + " menos " + getSpanishWord(b);
    if (lang === 'hi') return getHindiWord(a) + " minus " + getHindiWord(b);
    return getEnglishWord(a) + " minus " + getEnglishWord(b);
}
