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
 Utility function to generate the url of a single slide
 */
export function generateSlideUrl(title, index) {
  // TODO
  // check if are passed in all parameters
  // Check parameters
  // Slide must be a string
  // Index must be a number
  // Lang must be a string
  // Clean the title to make it an sane url
  // It will be the name of the page for the given slide
  const cleanedSlideTitle = this.cleanUrl(title.toLowerCase());
  // Add html extension
  const pageName = `${cleanedSlideTitle}.html`;
  // Return the path where the html page will be placed
  return `slides/${index}/${pageName}`;
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
