export interface ProjectDefinition {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  isModule: boolean;
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
  module: boolean;
  silent: boolean;
}
