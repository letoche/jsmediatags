jest
  .enableAutomock()
  .dontMock("../jsmediatags.js")
  .dontMock("../ByteArrayUtils.js");

const jsmediatags = require("../jsmediatags");
const ArrayFileReader = require("../ArrayFileReader");
const ID3v1TagReader = require("../ID3v1TagReader");
const ID3v2TagReader = require("../ID3v2TagReader");
const MP4TagReader = require("../MP4TagReader");

function throwOnSuccess(onError) {
  return {
    onSuccess: function() {
      throw new Error();
    },
    onError: onError
  }
}

describe("jsmediatags", function() {
  var mockFileReader;
  var mockTags = {};

  beforeEach(function() {
    jsmediatags.Config.removeTagReader(ID3v1TagReader);
    jsmediatags.Config.removeTagReader(MP4TagReader);

    ID3v2TagReader.getTagIdentifierByteRange.mockReturnValue(
      {offset: 0, length: 0}
    );
    ID3v2TagReader.prototype.setTagsToRead = jest.fn().mockReturnThis();
  });

  it("should read tags with the shortcut function", function() {
    ID3v2TagReader.canReadTagFormat.mockReturnValue(true);
    ID3v2TagReader.prototype.read = jest.fn()
      .mockImplementation(function(callbacks) {
        callbacks.onSuccess(mockTags);
      });

    return new Promise(function(resolve, reject) {
      jsmediatags.read("fakefile", {onSuccess: resolve, onError: reject});
      jest.runAllTimers();
    }).then(function(tags) {
      expect(tags).toBe(mockTags);
    });
  });

  describe("file readers", function() {
    it("should use the given file reader", function() {
      var reader = new jsmediatags.Reader();
      var MockFileReader = jest.fn();

      reader.setFileReader(MockFileReader);
      var fileReader = reader._getFileReader();

      expect(fileReader).toBe(MockFileReader);
    });

    it("should use the Array file reader for Buffers", function() {
      ArrayFileReader.canReadFile.mockReturnValue(true);

      var reader = new jsmediatags.Reader();
      var FileReader = reader._getFileReader();

      expect(FileReader).toBe(ArrayFileReader);
    });
  });

  describe("tag readers", function() {
    it("should use the given tag reader", function() {
      var MockTagReader = jest.fn();

      return new Promise(function(resolve, reject) {
        var reader = new jsmediatags.Reader();
        reader.setTagReader(MockTagReader);
        reader._getTagReader(null, {onSuccess: resolve, onError: reject});
        jest.runAllTimers();
      }).then(function(TagReader) {
        expect(TagReader).toBe(MockTagReader);
      });
    });

  });
});
