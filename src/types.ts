/**
 * Package json definition for the current working directory.
 */
export interface ProjectDefinition {
  name: string;
  executables: Record<string, string>;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

/**
 * A file that is dependant to the target dependency.
 */
export interface DependantFile {
  name: string;
  path: string;
  lineNumbers: number[];
}

export interface Dependants {
  scripts: string[];
  files: DependantFile[];
}

/**
 * A matching file in the current directory.
 */
export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}

/**
 * Options to be passed when analyzing imports to
 * target dependency.
 */
export interface ParserOptions {
  silent: boolean;
}

/**
 * Base function for all file parsers
 */
export type FileParser = (
  content: string,
  dependency: string,
) => Promise<number[]>;

export type CompilerLoader = () => Promise<void>;

export interface LoggerConfig {
  format: 'lines' | 'table';
}
