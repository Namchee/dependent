import { getCommonJSImportLines } from './cjs';
import { getESModulesImportLines } from './mjs';

import { FileParser } from '../types';

/**
 * Extension to parser map. Make sure to register the function here
 * when a new parser is added.
 */
const PARSER_MAP: Record<string, FileParser> = {
  cjs: getCommonJSImportLines,
  mjs: getESModulesImportLines,
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
  if (!(ext in PARSER_MAP)) {
    throw new Error(`.${ext} files are currently not supported`);
  }

  return PARSER_MAP[ext];
}
