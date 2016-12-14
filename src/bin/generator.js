#!/usr/bin/env node
'use strict';

import Generator from './../lib/generator';
import argv from 'yargs';
import path from 'path';
import chalk from 'chalk';

const args = argv
  .usage('Usage: $0 --data [file]')
  .option('config', {
    type: 'string',
    describe: 'JSON/JavaScript data file',
    requiresArg: true
  })
  .option('silent', {
    type: 'string',
    describe: 'Do not output logs'
  })
  .argv;

const consoleLog = args.silent ? () => {} : console.log;

const generateDeck = data => {
  const g = new Generator(data.paths, true);
  Promise.all([
    g.compileViews(data),
    g.compileStyles(data.compilers.sass, data.themeConfig)
  ])
    .then(results => {
      consoleLog(` ${chalk.bold.white('Speaker Deck')} --> ${chalk.cyan('Built')}`);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
};

const stdin = () => {
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    buf += chunk;
  });
  process.stdin.on('end', () => {
    const data = JSON.parse(buf);
    generateDeck(data);
  }).resume();
};

const getData = input => {
  try {
    return require(path.resolve(input));
  } catch (e) {
    console.error(e);
  }
};

if (args.data) {
  generateDeck(getData(args.data));
} else {
  stdin();
}
