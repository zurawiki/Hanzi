const decomposer = require('./decomposer');
const dict = require('./dictionary');

// Because of noe's require implementation,
// we will only initialize once per run, no matter how many requires we have.
decomposer.start();
dict.start();

exports.decompose = decomposer.decompose;
exports.decomposeMany = decomposer.decomposeMany;
exports.ifComponentExists = decomposer.ifComponentExists;
exports.definitionLookup = dict.definitionLookup;
exports.dictionarySearch = dict.dictionarySearch;
exports.getExamples = dict.getExamples;
exports.getPinyin = dict.getPinyin;
exports.segment = dict.segment;
exports.getCharacterFrequency = dict.getCharacterFrequency;
exports.determinePhoneticRegularity = dict.determinePhoneticRegularity;
exports.getRadicalMeaning = decomposer.getRadicalMeaning;
exports.getCharactersWithComponent = decomposer.getCharactersWithComponent;
exports.getPhoneticSet = dict.getPhoneticSet;
