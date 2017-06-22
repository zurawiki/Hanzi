var fs = require('fs');

function loadCCEDICT() {
  return fs.readFileSync(__dirname + '/dicts/cedict_ts.u8', 'utf-8');
}

function loadCJK() {
  return fs.readFileSync(__dirname + '/dicts/cjk-decomp.txt', 'utf-8');
}

function loadIrregularPhonetics() {
  return fs.readFileSync(__dirname + '/data/irregularphonetics.txt', 'utf-8');
}

function loadJunda() {
	 return fs.readFileSync(__dirname + '/data/frequencyjunda.txt', 'utf-8');
}

function loadLeiden() {
  return fs.readFileSync(__dirname + '/data/leidenfreqdata.txt', 'utf-8');
}

exports.loadCCEDICT = loadCCEDICT;
exports.loadCJK = loadCJK;
exports.loadIrregularPhonetics = loadIrregularPhonetics;
exports.loadJunda = loadJunda;
exports.loadLeiden = loadLeiden;
