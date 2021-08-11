import { FileParser } from '../types';

import { getJSImportLines } from './js';
import { getTSImportLines } from './ts';

/**
 * Extension to parser map. Make sure to register the function here
 * when a new parser is added.
 */
const PARSER_FUNCTIONS: Record<string, FileParser> = {
  js: getJSImportLines,
  ts: getTSImportLines,
  jsx: getJSImportLines,
  tsx: getTSImportLines,
};

/**
 * Extension to parser files. Make sure to register the package here
 * when a new extension support is added.
 */
const PARSER_PACKAGE: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
};

/**
 * Get the correct parser function for a file extension
 *
 * @param {string} ext File extension
 * @returns {FileParser} Parser function
 * @throws {Error} Throws an `Error` if the specified type
 * is not supported yet.
 */
export function getParser(ext: string): FileParser {
  if (!(ext in PARSER_FUNCTIONS)) {
    throw new Error(`.${ext} files are currently not supported`);
  }

  return PARSER_FUNCTIONS[ext];
}

/**
 * Get the required parser package for a file extension
 *
 * @param {string} ext File extension
 * @returns {string} Parser package
 * @throws {Error} Throws an `Error` if the specified type
 * is not supported yet.
 */
export function getParserPackage(ext: string): string {
  if (!(ext in PARSER_PACKAGE)) {
    throw new Error(`.${ext} files are currently not supported`);
  }

  return PARSER_PACKAGE[ext];
}
