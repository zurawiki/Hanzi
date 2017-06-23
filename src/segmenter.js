const MAX_WORD_LENGTH = 8;

class LongestMatchSegmenter {
  constructor(dict) {
    // dict should be a function that takes a chinese string as the
    // first param and returns something falsey if item is not in dict
    this.dict = dict;
  }

  getLongestMatch(input) {
    // eslint-disable-next-line no-plusplus
    for (let i = Math.min(MAX_WORD_LENGTH, input.length); i >= 0; --i) {
      const slice = input.substr(0, i);
      if (this.dict(slice)) {
        return slice;
      }
    }
    // no match found
    return undefined;
  }

  segment(input) {
    const segments = [];
    // loop through the input, slicing off each longestMatch and
    // appending it to the segments array
    let string = input.slice(0);
    while (string.length > 0) {
      const seg = this.getLongestMatch(string) || string.substr(0, 1);
      string = string.slice(seg.length);
      segments.push(seg);
    }
    return segments;
  }
}

exports.LongestMatchSegmenter = LongestMatchSegmenter;
