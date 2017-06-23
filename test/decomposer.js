const assert = require('assert');
const hanzi = require('../');

hanzi.start();

describe('hanzidecomposer', () => {
  it('checks if component exists', () => {
    assert(hanzi.ifComponentExists('爱'));
  });
  it("checks if component don't exist", () => {
    assert(!hanzi.ifComponentExists('$'));
  });

  it('detects invalid input', () => {
    assert.deepEqual(hanzi.decompose('a'), {
      character: 'a',
      components1: ['a'],
      components2: ['a'],
      components3: ['a'],
    });
  });

  it("gets a character's pinyin", () => {
    assert.deepEqual(hanzi.getPinyin('的'), ['de5', 'di2', 'di4']);
  });

  it("gets a radical's meaning", () => {
    assert(hanzi.getRadicalMeaning('氵'), 'water');
    assert(hanzi.getRadicalMeaning('爫'), 'claw/talon');
    assert(hanzi.getRadicalMeaning('冖'), 'cover');
    assert(hanzi.getRadicalMeaning('𠂇'), 'left hand');
    assert(hanzi.getRadicalMeaning('又'), 'right hand');
    assert(hanzi.getRadicalMeaning('心'), 'heart');
    assert(hanzi.getRadicalMeaning('夂'), 'go');
  });

  it('gets character frequency data', () => {
    assert.deepEqual(hanzi.getCharacterFrequency('热'), {
      number: '606',
      character: '热',
      count: '67051',
      percentage: '79.8453694124',
      pinyin: 're4',
      meaning: 'heat/to heat up/fervent/hot (of weather)/warm up',
    });
    assert.deepEqual(hanzi.getCharacterFrequency('⺙'), 'Character not found');
    assert.deepEqual(hanzi.getCharacterFrequency('好'), {
      number: '82',
      character: '好',
      count: '411866',
      percentage: '38.1712637099',
      pinyin: 'hao3/hao4',
      meaning: 'good/well, be fond of',
    });
  });

  it('gets all characters with a given component', () => {
    assert.deepEqual(hanzi.getCharactersWithComponent('囗'), ['国', '因', '西', '回', '口', '四', '团', '图', '围', '困', '恩', '固', '烟', '园', '窗', '圆', '惯', '圈', '贯', '衰', '菌', '傻', '姻', '咽', '嗯', '囚', '捆', '茵', '粤', '瑙', '圃', '囱', '涸', '媲', '锢', '胭', '泗', '蓑', '囤', '囿', '泅', '摁', '囡', '帼', '氤', '蝈', '邋', '蓖', '崮', '囫', '囟', '掼', '圜', '囵', '驷', '阃', '鬣', '囹', '痼', '圄', '卣', '掴', '腦', '榱', '篦', '硇', '涠', '洇', '總', '鱲', '囝', '貔', '圉', '溷', '缞', '鲴', '悃', '铟', '腘', '骢', '躐', '謴', '璁', '蒽', '骃', '鯝', '镴', '硱', '鬛', '逌', '睏', '秵', '絪', '駰', '麕', '螕', '裀', '稛', '縕', '糰', '箇', '膕', '綑', '臘', '箘', '聰', '蔥', '驄', '薀', '祻', '繌', '圊', '罆', '謥', '貫', '鏆', '銦', '蒕', '簑', '碅', '薗', '釦', '稇', '蜠', '蠟', '醞']);
  });

  it('determines phonetic regularity', () => {
    const expected = {
      di1: {
        character: '低',
        component: ['亻', '氐', '氐', '亻', '氏', '氏', '丶', '丶'],
        phoneticpinyin: ['ren2', 'di1', 'di3', 'ren2', 'shi4', 'zhi1', 'dian3', 'zhu3'],
        regularity: [0, 1, 2, 0, 4, 4, 3, 0],
      },
    };
    assert.deepEqual(hanzi.determinePhoneticRegularity('低'), expected);
  });

  it('should once decompose simplified character', () => {
    assert.deepEqual(hanzi.decompose('爱').components1, ['No glyph available', '友']);
  });
  it('should radical decompose simplified character', () => {
    assert.deepEqual(hanzi.decompose('爱').components2, ['爫', '冖', '𠂇', '又']);
  });
  it('should graphical decompose simplified character', () => {
    assert.deepEqual(hanzi.decompose('爱').components3, ['爫', '冖', '𠂇', '㇇', '㇏']);
  });

  it('should once decompose traditional character', () => {
    assert.deepEqual(hanzi.decompose('愛').components1, ['No glyph available', '夂']);
  });
  it('should radical decompose traditional character', () => {
    assert.deepEqual(hanzi.decompose('愛').components2, ['爫', '冖', '心', '夂']);
  });
  it('should graphical decompose traditional character', () => {
    assert.deepEqual(hanzi.decompose('愛').components3, ['爫', '冖', '𠁼', '㇃', '㇇', '㇏', '㇒']);
  });
});
