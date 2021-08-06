import { FileParser } from '../types';

import { getCJSImportLines } from './cjs';
import { getESMImportLines } from './mjs';
import { getTSImportLines } from './ts';
import { getJSXImportLines } from './jsx';
import { getTSXImportLines } from './tsx';

/**
 * Extension to parser map. Make sure to register the function here
 * when a new parser is added.
 */
const PARSER_MAP: Record<string, FileParser> = {
  cjs: getCJSImportLines,
  mjs: getESMImportLines,
  ts: getTSImportLines,
  jsx: getJSXImportLines,
  tsx: getTSXImportLines,
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
