import { FileParser } from '@/types';

import { getJSImportLines } from '@/service/parser/js';
import { getSvelteImportLines, loadSvelteCompiler } from '@/service/parser/svelte';
import { getTSImportLines, loadTSCompiler } from '@/service/parser/ts';
import { getVueImportLines, loadVueCompiler } from '@/service/parser/vue';

import { CompilerLoader } from '@/types';

/**
 * Extension to parser map. Make sure to register the function here
 * when a new parser is added.
 */
const PARSER_MAP: Record<string, FileParser> = {
  js: getJSImportLines,
  mjs: getJSImportLines,
  cjs: getJSImportLines,
  jsx: getJSImportLines,
  ts: getTSImportLines,
  vue: getVueImportLines,
  svelte: getSvelteImportLines,
};

const COMPILER_MAP: Record<string, CompilerLoader>  = {
  ts: loadTSCompiler,
  tsx: loadTSCompiler,
  vue: loadVueCompiler,
  svelte: loadSvelteCompiler,
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

/**
 * Get the compiler for a file extension
 *
 * @param {string} ext file extension
 * @returns {() => Promise<void>} loader function
 */
export function getCompiler(ext: string): CompilerLoader {
  if (!(ext in COMPILER_MAP)) {
    throw new Error(`.${ext} files are currently not supported`);
  }

  return COMPILER_MAP[ext];
}
