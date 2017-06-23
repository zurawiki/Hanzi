function loadCCEDICT() {
  return require('../data/cedict_ts.u8');
}

function loadCJK() {
  return require('../data/cjk-decomp.txt');
}

function loadIrregularPhonetics() {
  return require('../data/irregularphonetics.txt');
}

function loadJunda() {
  return require('../data/frequencyjunda.txt');
}

function loadLeiden() {
  return require('../data/leidenfreqdata.txt');
}

exports.loadCCEDICT = loadCCEDICT;
exports.loadCJK = loadCJK;
exports.loadIrregularPhonetics = loadIrregularPhonetics;
exports.loadJunda = loadJunda;
exports.loadLeiden = loadLeiden;
