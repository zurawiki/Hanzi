const data = require('./data');
const radicals = require('./data/radicalListWithMeaning').radicalListWithMeaning;

const NO_GLYPH = 'No glyph available';

const characterStore = {};
const characterWithComponent = {};

function start() {
  // Reading in charData - Decomposition Database
  const readFile = data.loadCJK();
  const lines = readFile.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const [character, decomposition] = lines[i].split(':');
    const openbracket = decomposition.indexOf('(');
    const closebracket = decomposition.indexOf(')');
    const typeOfDecomposition = decomposition.substring(0, openbracket);
    const components = decomposition.substring(openbracket + 1, closebracket).split(',');
    characterStore[character] = {
      typeOfDecomposition,
      components,
    };
  }

  // Compile Components into an object array for easy lookup
  compileAllComponents();
}

function compileAllComponents() {
  const readFile = data.loadJunda();
  const lines = readFile.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const split = lines[i].split('\t');
    const character = split[1];
    const decomposition = decompose(character);

    for (let j = 0; j < decomposition.components1.length; j++) {
      const component = decomposition.components1[j];
      if (typeof characterWithComponent[component] === 'undefined') {
        if (component != NO_GLYPH) {
          characterWithComponent[component] = [];
          characterWithComponent[component].push(character);
        }
      } else if (component != NO_GLYPH) characterWithComponent[component].push(character);
    }

    for (let j = 0; j < decomposition.components2.length; j++) {
      const component = decomposition.components2[j];
      if (typeof characterWithComponent[component] === 'undefined') {
        if (component != NO_GLYPH && component.search(/[一丨丶⺀丿乙⺃乚⺄亅丷]/g) == -1) {
          characterWithComponent[component] = [];
          if (unique(characterWithComponent[component], character)) characterWithComponent[component].push(character);
        }
      } else if (component != NO_GLYPH && component.search(/[一丨丶⺀丿乙⺃乚⺄亅丷]/g) == -1) {
        if (unique(characterWithComponent[component], character)) characterWithComponent[component].push(character);
      }
    }
  }
}

function unique(list, token) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === token) {
      return false;
    }
  }
  return true;
}

function decomposeMany(characterstring, typeOfDecomposition) {
  const decomposearray = {};

  // remove spaces from input string
  characterstring = characterstring.replace(/\s/g, '');
  if (characterstring == null || characterstring == '') {
    return 'Invalid Input';
  }

  for (let i = 0; i < characterstring.length; i++) {
    const onechar = characterstring.substring(i, i + 1);

    // don't decompose the same character more than once
    if (!decomposearray[onechar]) {
      decomposearray[onechar] = decompose(onechar, typeOfDecomposition);
    }
  }
  return decomposearray;
}

function decompose(character, typeOfDecomposition) {
  character = character.replace(/\s/g, '');
  if (isMessy(character)) {
    return 'Invalid Input';
  }
  let object;

  /* -- Type of Decomposition: 1 = Only 2 components， 2 = Radical, 3 = Graphical) --*/
  if (typeOfDecomposition == null) {
    object = {
      character,
      components1: onceDecompose(character),
      components2: radicalDecomposition(character),
      components3: graphicalDecomposition(character),
    };
  } else if (typeOfDecomposition == 1) {
    object = {character, components: onceDecompose(character)};
  } else if (typeOfDecomposition == 2) {
    object = {
      character,
      components: radicalDecomposition(character),
    };
  } else if (typeOfDecomposition == 3) {
    object = {
      character,
      components: graphicalDecomposition(character),
    };
  } else {
    return;
  }
  const string = JSON.stringify(object);
  const jsonoutput = JSON.parse(string);
  return jsonoutput;

  // Functions to help with Decomposition

  function onceDecompose(character) {
    const components = getComponents(character);
    return replaceNumbers(components);
  }

  function radicalDecomposition(character) {
    let final_array = [];
    if (isRadical(character)) {
      final_array.push(character);
    } else {
      const components = getComponents(character);
      if (components.length == 2) {
        for (let j = 0; j < 2; j++) {
          final_array = final_array.concat(radicalDecomposition(components[j]));
        }
      } else {
        final_array.push(character);
      }
    }
    return replaceNumbers(final_array);
  }

  function graphicalDecomposition(character) {
    let final_array = [];
    const components = getComponents(character);
    if (components.length == 2) {
      for (let j = 0; j < 2; j++) {
        final_array = final_array.concat(graphicalDecomposition(components[j]));
      }
    } else if (isNaN(character)) {
      final_array.push(character);
    } else {
      final_array = final_array.concat(resolveNumber(character));
    }

    return final_array;
  }
}

function replaceNumbers(characters) {
  const finalreview = [];
  for (let i = 0; i < characters.length; i++) {
    if (isNaN(characters[i])) {
      finalreview.push(characters[i]);
    } else {
      finalreview.push('No glyph available');
    }
  }

  return finalreview;
}

function resolveNumber(number) {
  let numberscleared = [];
  const components = getComponents(number);
  let i = 0;
  for (; i < components.length; i++) {
    if (isNaN(components[i])) {
      numberscleared.push(components[i]);
    } else {
      numberscleared = numberscleared.concat(resolveNumber(components[i]));
    }
  }

  return numberscleared;
}

function getCharactersWithComponent(component) {
  if (typeof radicals[component] !== 'undefined') {
    const components = findSameMeaningRadicals(component);
    let characters = [];
    let i = 0;
    for (; i < components.length; i++) {
      if (typeof characterWithComponent[components[i]] !== 'undefined') characters = characters.concat(characterWithComponent[components[i]]);
    }
    return characters;
  }

  if (typeof characterWithComponent[component] !== 'undefined') return characterWithComponent[component];
  return `${component} not found`;
}

function findSameMeaningRadicals(radical) {
  const same_radicals = [];
  const meaning = radicals[radical];
  for (var radical in radicals) {
    if (radicals.hasOwnProperty(radical)) {
      if (radicals[radical] == meaning) same_radicals.push(radical);
    }
  }
  return same_radicals;
}

function isRadical(character) {
  let isRad = false;
  if (typeof radicals[character] !== 'undefined') {
    isRad = true;
  }
  return isRad;
}

function getComponents(character) {
  if (ifComponentExists(character)) {
    if (characterStore[character].typeOfDecomposition == 'c') {
      return character;
    }

    return characterStore[character].components;
  }

  return character;
}

function getRadicalMeaning(radical) {
  if (isRadical(radical)) {
    return radicals[radical];
  }

  return 'N/A';
}

function ifComponentExists(component) {
  return typeof characterStore[component] !== 'undefined';
}

function isMessy(character) {
  // If no input is sent
  if (character == null || character == '') {
    return true;
  }
  // If it's not a Chinese character
  return typeof getComponents(character) === 'undefined';
}

exports.start = start;
exports.decompose = decompose;
exports.decomposeMany = decomposeMany;
exports.ifComponentExists = ifComponentExists;
exports.getRadicalMeaning = getRadicalMeaning;
exports.getCharactersWithComponent = getCharactersWithComponent;
