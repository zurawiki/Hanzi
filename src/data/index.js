function loadCCEDICT() {
  return require('./cedict_ts.u8');
}

function loadCJK() {
  return require('./cjk-decomp.txt');
}

function loadIrregularPhonetics() {
  return require('./irregularphonetics.txt');
}

function loadJunda() {
  return require('./frequencyjunda.txt');
}

function loadLeiden() {
  return require('./leidenfreqdata.txt');
}

exports.loadCCEDICT = loadCCEDICT;
exports.loadCJK = loadCJK;
exports.loadIrregularPhonetics = loadIrregularPhonetics;
exports.loadJunda = loadJunda;
exports.loadLeiden = loadLeiden;
