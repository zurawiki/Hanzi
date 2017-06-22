
function loadCCEDICT() {
  return require('./dicts/cedict_ts.txt');
}

function loadCJK() {
	return require('./dicts/cjk-decomp.txt');
}

function loadIrregularPhonetics() {
  return require('./data/irregularphonetics.txt');
}

function loadJunda() {
	 return require('./data/frequencyjunda.txt');
}

function loadLeiden() {
  return require('./data/leidenfreqdata.txt');
}

exports.loadCCEDICT = loadCCEDICT;
exports.loadCJK = loadCJK;
exports.loadIrregularPhonetics = loadIrregularPhonetics;
exports.loadJunda = loadJunda;
exports.loadLeiden = loadLeiden;
