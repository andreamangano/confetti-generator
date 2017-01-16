'use strict';
export default {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "Slide",
  "properties": {
    "title": {
      "type": "string"
    },
    "index": {
      "type": "number"
    },
    "url": {
      "type": "string"
    },
    "cover": {
      "type": "object",
      "properties": {
        "file": "string",
        "format": "object"
      },
      "required": [
        "file",
        "format"
      ]
    }
  },
  "required": [
    "title",
    "index",
    "url"
  ]
}