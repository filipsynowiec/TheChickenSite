class DictionaryGenerator {
  static initalized = false;
  static dictionary = new Set();
  static getDictionary() {
    if (DictionaryGenerator.initalized) {
      return DictionaryGenerator.dictionary;
    }
    var lineReader = require("readline").createInterface({
      input: require("fs").createReadStream(
        "src/server/games/scrabble/allowed_words.txt"
      ),
    });
    lineReader.on("line", function (line) {
        DictionaryGenerator.dictionary.add(line);
    });
    DictionaryGenerator.initalized = true;
    return DictionaryGenerator.dictionary;
  }
}

module.exports = {
  DictionaryGenerator: DictionaryGenerator,
};
