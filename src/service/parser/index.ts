import { FileParser } from '@/types';

import { getSvelteImportLines } from '@/service/parser/svelte';
import { getTSImportLines } from '@/service/parser/ts';
import { getVueImportLines } from '@/service/parser/vue';
import { getAstroImportLines } from '@/service/parser/astro';

/**
 * Extension to parser map. Make sure to register the function here
 * when a new parser is added.
 */
const PARSER_MAP: Record<string, FileParser> = {
  js: getTSImportLines,
  mjs: getTSImportLines,
  cjs: getTSImportLines,
  jsx: getTSImportLines,
  ts: getTSImportLines,
  vue: getVueImportLines,
  svelte: getSvelteImportLines,
  astro: getAstroImportLines,
};

/**
 * Get the parser function for a file extension
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
