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
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}
