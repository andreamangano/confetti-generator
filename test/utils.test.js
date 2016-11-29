'use strict';
import * as utils from './../src/lib/utils';
import path from 'path';
describe("Utils", function() {
  const temp = path.join(__dirname, 'temp');
  describe("cleanUrl()", function() {
    const urls = [
      {
        prop: "Given an url with spaces, should clean spaces and replace them with '-' symbol",
        original: "it is my url",
        expected: "it-is-my-url"
      },
      {
        prop: "Given an url with single and double spaces, should clean",
        original: "it  is my url",
        expected: "it-is-my-url"
      },
      {
        prop: "Given an url, should remove unwanted characters -different from [^A-Za-z0-9]-",
        original: "it@ (#is)=?^£' my+ url*§ç",
        expected: "it-is-my-url"
      }
    ];
    urls.forEach(function(item) {
      it(`${item.prop}`, function() {
        utils.cleanUrl(item.original).should.equal(item.expected);
      });
    });
    it("should throw if the url parameter is not a string", function() {
      (function() {
        utils.cleanUrl({})
      }).should.throw(Error);
    });
  });
  describe("generateSlideUrl( title, index )", function() {
    let urlRegex = /slides\/[0-9]*\/[a-z0-9-]*.html/;
    it("should return a string", function() {
      utils.generateSlideUrl('my title', 1).should.be.an('string');
    });
    it(`should match ${urlRegex}`, function() {
      let url = utils.generateSlideUrl('my title', 1);
      url.should.match(urlRegex);
    })
  });
});