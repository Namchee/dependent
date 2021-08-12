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
