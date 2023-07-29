/**
 * Get root package name from an import identifier
 *
 * @param {string} identifier package identifier
 * @returns {string} actual package name
 */
export function getRootPackage(identifier: string): string {
  const tokens = identifier.split('/');

  // Scoped package
  if (identifier.startsWith('@')) {
    return tokens.slice(0, 2).join('/');
  }

  return tokens[0];
}

export function getActualVersion(semver: string): string {
  return semver.replace(/^([\^~><>=])+/, '');
}
