export interface ProjectDefinition {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

export interface DependantFile {
  name: string;
  path: string;
  lineNumbers: number[];
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}

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
