#!/usr/bin/env node
'use strict';
import Generator from './../lib/generator';
const stdin = process.stdin;
let content = '';
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', buf => {
  content += buf;
});
stdin.on('end', () => {
  const data = JSON.parse(content);
  const g = new Generator(data.paths, true);
  g.compileViews(data);
  console.log('data.theme: ' + data.theme);
});
