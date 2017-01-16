'use strict';
import fs from 'fs';
import path from 'path';
/*
 Utility function to clean url
 */
export function cleanUrl(url) {
  if (typeof url !== 'string') {
    throw new Error('The parameter -url- must be a string.');
  }
  // Remove unwanted characters, only accept alphanumeric and space
  let cleanUrl = url.replace(/[^A-Za-z0-9 ]/g, '');
  // Remove multi spaces with a single one
  cleanUrl = cleanUrl.replace(/\s{2,}/g, ' ');
  // Replace space with a '-' symbol
  cleanUrl = cleanUrl.replace(/\s/g, '-');
  return cleanUrl;
}
/*
 Utility to recursively list files inside a folder
 */
export function listFile(dir, fullPath, filelist = []) {
  try {
    fs.readdirSync(dir).forEach(file => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? listFile(path.join(dir, file), fullPath, filelist)
        : filelist.concat(fullPath ? path.join(dir, file) : file);
    });
    return filelist;
  } catch (err) {
    throw new Error(err);
  }
}
/*
  Utility to check if a dir exists
*/
export function dirExists(dir) {
  try {
    fs.accessSync(dir);
    return true;
  } catch (e) {
    return false;
  }
}
