const fs = require('fs');

const dictionarysimplified = {};
const dictionarytraditional = {};
const hanzi = require('./hanzidecomposer.js');

let phonetic_set_one = {};
let phonetic_set_two = {};

const Segmenter = require('./segmenter.js').LongestMatchSegmenter;

const segmenter = new Segmenter(definitionLookup);

function start() {
  console.log('Hanzi is compiling dictionary...');

  // Reading in CCEDICT
  const readFile = fs.readFileSync(`${__dirname}/dicts/cedict_ts.u8`, 'utf-8');
  const lines = readFile.split(/\r?\n/);
  loadIrregularPhonetics();
  loadFrequencyData();
  phonetic_set_one = require('./data/phonetic_sets_regularity_one.js').regularity_one;
  phonetic_set_two = require('./data/phonetic_sets_regularity_two.js').regularity_two;

  const STARTING_LINE = 30;
  for (let i = STARTING_LINE; i < lines.length; i++) {
    const multiplearray = [getElements(i)];
    while (multiplearray[0].traditional == nextChar(i + 1)) {
      multiplearray.push(getElements(i + 1));
      i++;
    }

    dictionarysimplified[multiplearray[0].simplified] = multiplearray;
    dictionarytraditional[multiplearray[0].traditional] = multiplearray;
  }

  function nextChar(j) {
    if (j < lines.length) {
      const nextcharacter = lines[j].split(' ');
      const nextcheck = nextcharacter[0];
      return nextcheck;
    }
    return '';
  }

  function getElements(i) {
    const openbracket = lines[i].indexOf('[');
    const closebracket = lines[i].indexOf(']');
    const defStart = lines[i].indexOf('/');
    const defClose = lines[i].lastIndexOf('/');
    const pinyin = lines[i].substring(openbracket + 1, closebracket);
    const definition = lines[i].substring(defStart + 1, defClose);
    const elements = lines[i].split(' ');
    const traditional = elements[0];
    const simplified = elements[1];
    return {
      traditional,
      simplified,
      pinyin,
      definition,
    };
  }
}

function definitionLookup(word, scripttype) {
  if (scripttype == null) {
    if (determineIfSimplified(word)) {
      return dictionarysimplified[word];
    }
    if (!determineIfSimplified(word)) {
      return dictionarytraditional[word];
    }
  } else {
    if (scripttype == 's') {
      return dictionarysimplified[word];
    }

    return dictionarytraditional[word];
  }
}

function dictionarySearch(character, type) {
  /* --- Types: Only = Just the characters and no alternatives. If not then finds all cases of that character ---*/
  const search = [];
  let regexstring = '^(';

  if (type == 'only') {
    for (let i = 0; i < character.length; i++) {
      if (i < character.length - 1) {
        regexstring = `${regexstring + character.substring(i, i + 1)}|`;
      } else {
        regexstring = `${regexstring + character.substring(i, i + 1)})+$`;
      }
    }
  } else {
    regexstring = `[${character}]`;
  }

  const re = new RegExp(regexstring, 'g');

  // First check for simplified.
  for (var word in dictionarysimplified) {
    if (dictionarysimplified.hasOwnProperty(word)) {
      if (word.search(re) != -1) {
        search.push(dictionarysimplified[word]);
      }
    }
  }

  // If there's nothing to be found, then try and look for traditional entries.
  if (search == '') {
    for (word in dictionarytraditional) {
      if (dictionarytraditional.hasOwnProperty(word)) {
        if (word.search(re) != -1) {
          search.push(dictionarytraditional[word]);
        }
      }
    }
  }

  return search;
}

function getExamples(character) {
  /* --- Does a dictionary search and finds the most useful example words ---*/

  const isSimplified = determineIfSimplified(character);

  const potentialexamples = dictionarySearch(character);
  const allfreq = [];
  const lowfreq = [];
  const midfreq = [];
  const highfreq = [];
  let i = 0;
  for (; i < potentialexamples.length; i++) { // Create Array of Frequency Points to calculate distributions
    // It takes the frequency accounts of both scripts into account.

    const wordsimp = potentialexamples[i][0].simplified;
    const wordtrad = potentialexamples[i][0].traditional;

    let totalfrequency = 0;
    if (typeof wordfreq[wordsimp] !== 'undefined') {
      totalfrequency += parseInt(wordfreq[wordsimp]);
    }
    if (typeof wordfreq[wordtrad] !== 'undefined') {
      totalfrequency += parseInt(wordfreq[wordtrad]);
    }
    allfreq.push(totalfrequency);
  }

  // Calculate mean, variance + sd
  allfreq.sort((a, b) => a - b);
  const mean = calculateMean();
  const variance = calculateVariance(mean);
  const sd = Math.sqrt(variance);

  determineFreqCategories();

  // Create frequency categories
  function determineFreqCategories() {
    if (mean - sd < 0) {
      var lowrange = 0 + (mean / 3);
    } else {
      var lowrange = mean - sd;
    }
    const midrange = [mean + sd, lowrange];
    const highrange = mean + sd;

    let i = 0;
    for (; i < potentialexamples.length; i++) {
      const word = potentialexamples[i][0];

      if (typeof wordfreq[word.simplified] !== 'undefined') {
        pushFrequency(word);
      }
    }

    function pushFrequency(word) {
      if (wordfreq[word.simplified] < lowrange) {
        lowfreq.push(word);
      }
      if (wordfreq[word.simplified] > midrange[1] && wordfreq[word.simplified] < midrange[0]) {
        midfreq.push(word);
      }
      if (wordfreq[word.simplified] > highrange) {
        highfreq.push(word);
      }
    }
  }

  const examplewords = [highfreq, midfreq, lowfreq];
  return examplewords;

  function calculateMean() {
    let total = 0;
    let i = 0;
    for (; i < allfreq.length; i++) {
      total += parseInt(allfreq[i], 10);
    }
    const mean = total / allfreq.length;
    return mean;
  }

  function calculateVariance() {
    let total = 0;
    let i = 0;
    for (; i < allfreq.length; i++) {
      const localvar = parseInt(allfreq[i], 10) - mean;
      total += localvar * localvar;
    }
    const variance = total / allfreq.length;
    return variance;
  }
}

function determineIfSimplified(character) {
  if (typeof dictionarysimplified[character] !== 'undefined') {
    return true;
  }
  if (typeof dictionarytraditional[character] !== 'undefined') {
    return false;
  }
}

const charfreq = {};
var wordfreq = {};
function loadFrequencyData() {
  console.log('Starting to read frequency data');

  var readFile = fs.readFileSync(`${__dirname}/data/leidenfreqdata.txt`, 'utf-8');
  let lines = readFile.split(/\r?\n/);

  var i = 0;
  for (; i < lines.length; i++) {
    var splits = lines[i].split(',');
    const word = splits[0];
    const freq = splits[1];
    wordfreq[word] = freq;
  }

  var readFile = fs.readFileSync(`${__dirname}/data/frequencyjunda.txt`, 'utf-8');
  lines = readFile.split(/\r?\n/);
  var i = 0;
  for (; i < lines.length; i++) {
    var splits = lines[i].split('\t');
    charfreq[splits[1]] = {
      number: splits[0],
      character: splits[1],
      count: splits[2],
      percentage: splits[3],
      pinyin: splits[4],
      meaning: splits[5],
    };
  }
  console.log('Frequency data loaded');
}

const irregularphonetics = {};
function loadIrregularPhonetics() {
  const readFile = fs.readFileSync(`${__dirname}/data/irregularphonetics.txt`, 'utf-8');
  const lines = readFile.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const splits = lines[i].split(':');
    const character = splits[0];
    const pinyin = splits[1];
    irregularphonetics[character] = pinyin;
  }
}

function getPinyin(character) {
  // These are for components not found in CC-CEDICT.
  if (typeof dictionarysimplified[character] !== 'undefined') {
    var i = 0;
    var pinyinarray = [];
    for (; i < dictionarysimplified[character].length; i++) {
      pinyinarray[i] = dictionarysimplified[character][i].pinyin;
    }
    return pinyinarray;
  }
  if (typeof dictionarytraditional[character] !== 'undefined') {
    var i = 0;
    var pinyinarray = [];
    for (; i < dictionarytraditional[character].length; i++) {
      pinyinarray[i] = dictionarytraditional[character][i].pinyin;
    }
    return pinyinarray;
  }
  if (typeof irregularphonetics[character] !== 'undefined') {
    return [irregularphonetics[character]];
  }
  if (character.search(/[㇐㇇㇚𤴓𠂇㇒㇑⺊阝㇟⺀㇓㇝𪜋⺁𠮛㇔龶㇃丆㇏⺌⺹⺆㇛㇠㇆⺧⺮龸⺈㇗龴㇕㇈㇖⺤㇎⺺䧹㇂㇉⺪㇀]/g) != -1) {
    return ['_stroke'];
  }
  if (isNaN(character) == false) {
    return ['_number'];
  }
  return null;
}

function determinePhoneticRegularity(decomposition) {
  let regularityarray = {};
  // An object is not passed to this function, create the decomposition object with the character input
  if (typeof decomposition.character === 'undefined') {
    decomposition = hanzi.decompose(decomposition);
  }

  // Get all possible pronunciations for character
  const charpinyin = getPinyin(decomposition.character);
  if (charpinyin == null) {
    return regularityarray = null;
  }

  let phoneticpinyin = [];

  // Determine phonetic regularity for components on level 1 decomposition
  for (var k = 0; k < decomposition.components1.length; k++) {
    phoneticpinyin = getPinyin(decomposition.components1[k]); // Get the pinyin of the component

    var i = 0;
    for (; i < charpinyin.length; i++) { // Compare it with all the possible pronunciations of the character
      // Init Object
      if (typeof regularityarray[charpinyin[i]] === 'undefined') { // If the object store has no character pinyin stored yet, create the point
        regularityarray[charpinyin[i]] = {
          character: decomposition.character,
          component: [],
          phoneticpinyin: [],
          regularity: [],
        };
      }

      if (phoneticpinyin == null) { // If the component has no pronunciation found, nullify the regularity computation
        regularityarray[charpinyin[i]].phoneticpinyin.push(null);
        regularityarray[charpinyin[i]].component.push(decomposition.components1[k]);
        regularityarray[charpinyin[i]].regularity.push(null);
      } else { // Compare the character pinyin to all possible phonetic pinyin pronunciations
        var j = 0;
        for (; j < phoneticpinyin.length; j++) {
          regularityarray[charpinyin[i]].phoneticpinyin.push(phoneticpinyin[j]);
          regularityarray[charpinyin[i]].component.push(decomposition.components1[k]);
          regularityarray[charpinyin[i]].regularity.push(getRegularityScale(charpinyin[i], phoneticpinyin[j]));
        }
      }
    }
  }

  for (var k = 0; k < decomposition.components2.length; k++) {
    phoneticpinyin = getPinyin(decomposition.components2[k]); // Get the pinyin of the component

    var i = 0;
    for (; i < charpinyin.length; i++) { // Compare it with all the possible pronunciations of the character
      // Init Object
      if (typeof regularityarray[charpinyin[i]] === 'undefined') { // If the object store has no character pinyin stored yet, create the point
        regularityarray[charpinyin[i]] = {
          character: decomposition.character,
          component: [],
          phoneticpinyin: [],
          regularity: [],
        };
      }

      if (phoneticpinyin == null) { // If the component has no pronunciation found, nullify the regularity computation
        regularityarray[charpinyin[i]].phoneticpinyin.push(null);
        regularityarray[charpinyin[i]].component.push(decomposition.components2[k]);
        regularityarray[charpinyin[i]].regularity.push(null);
      } else { // Compare the character pinyin to all possible phonetic pinyin pronunciations
        var j = 0;
        for (; j < phoneticpinyin.length; j++) {
          regularityarray[charpinyin[i]].phoneticpinyin.push(phoneticpinyin[j]);
          regularityarray[charpinyin[i]].component.push(decomposition.components2[k]);
          regularityarray[charpinyin[i]].regularity.push(getRegularityScale(charpinyin[i], phoneticpinyin[j]));
        }
      }
    }
  }
  return regularityarray;
}

function getCharacterFrequency(character) {
  if (typeof charfreq[character] !== 'undefined') return charfreq[character];

  const traditional_character = definitionLookup(character);
  if (traditional_character && traditional_character[0]) {
    if (typeof charfreq[traditional_character[0].simplified] !== 'undefined') {
      return charfreq[traditional_character[0].simplified];
    }
  }
  return 'Character not found';
}

// Helper Functions
function getRegularityScale(charpinyin, phoneticpinyin) {
  if (charpinyin == null || phoneticpinyin == null) {
    return null;
  }
  let regularity = 0;
  charpinyin = new PinyinSyllable(charpinyin.toLowerCase());
  phoneticpinyin = new PinyinSyllable(phoneticpinyin.toLowerCase());

  // Regularity Scale: 1 = Exact Match (with tone), 2 = Syllable Match (without tone)
  // 3 = Similar in Initial, 4 = Similar in Final, 0 = No regularity

  // First test for Scale 1 & 2
  if (charpinyin.syllable() == phoneticpinyin.syllable()) {
    regularity = 2;
    if (charpinyin.raw_syllable == phoneticpinyin.raw_syllable) {
      regularity = 1;
    }
  }

  // If still no regularity found, test for initial & final regularity (scale 3 & 4)
  if (regularity == 0) {
    if (charpinyin.final() == phoneticpinyin.final()) {
      regularity = 4;
    } else if (charpinyin.initial() == phoneticpinyin.initial()) {
      regularity = 3;
    }
  }

  return regularity;
}

function getPhoneticSet(regularity_scale) {
  switch (regularity_scale) {
    case 1:
      return phonetic_set_one;
      break;
    case 2:
      return phonetic_set_two;
      break;
    default:
  }
}

function PinyinSyllable(raw_syllable) {
  this.raw_syllable = raw_syllable;
}

// Methods
PinyinSyllable.prototype.syllable = function () {
  // Returns Pinyin sans tone
  return this.raw_syllable.substring(0, this.raw_syllable.length - 1);
};

PinyinSyllable.prototype.initial = function () {
  // Returns the initial of pinyin syllable
  let initial = '';
  if (this.raw_syllable.substring(1, 2) == 'h') {
    // Take into zh, ch, sh
    initial = this.raw_syllable.substring(0, 2);
  } else {
    initial = this.raw_syllable.substring(0, 1);
  }
  return initial;
};

PinyinSyllable.prototype.final = function () {
  const syllable = this.syllable();
  const rhyme = syllable.replace(this.initial(), '');
  return rhyme;
};

exports.start = start;
exports.definitionLookup = definitionLookup;
exports.dictionarySearch = dictionarySearch;
exports.getExamples = getExamples;
exports.getPinyin = getPinyin;
exports.getCharacterFrequency = getCharacterFrequency;
exports.determinePhoneticRegularity = determinePhoneticRegularity;
exports.getPhoneticSet = getPhoneticSet;
exports.segment = segmenter.segment.bind(segmenter);
