const hanzi = require('./hanzidecomposer');
const dict = require('./dictionary');

// Because of noe's require implementation,
// we will only initialize once per run, no matter how many requires we have.
hanzi.start();
dict.start();

exports.decompose = hanzi.decompose;
exports.decomposeMany = hanzi.decomposeMany;
exports.ifComponentExists = hanzi.ifComponentExists;
exports.definitionLookup = dict.definitionLookup;
exports.dictionarySearch = dict.dictionarySearch;
exports.getExamples = dict.getExamples;
exports.getPinyin = dict.getPinyin;
exports.segment = dict.segment;
exports.getCharacterFrequency = dict.getCharacterFrequency;
exports.determinePhoneticRegularity = dict.determinePhoneticRegularity;
exports.getRadicalMeaning = hanzi.getRadicalMeaning;
exports.getCharactersWithComponent = hanzi.getCharactersWithComponent;
exports.getPhoneticSet = dict.getPhoneticSet;
