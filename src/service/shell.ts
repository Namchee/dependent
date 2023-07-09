import { resolveDependantPackageJSON, resolvePackageJSON } from '@/service/package';

/**
 * Returns a list of script in the current working directory that
 * depends on `dependency`
 *
 * @param {string} dependency dependency name
 * @returns {string[]} list of dependant scripts
 */
export function getDependantScript(
  dependency: string,
): string[] {
  const { scripts } = resolvePackageJSON();
  const { executables } = resolveDependantPackageJSON(dependency);

  const pattern = new RegExp(`\b(${Object.keys(executables).join('|')})\b`, 'g');

  const result = [];

  for (const [script, value] of Object.entries(scripts)) {
    if (pattern.exec(value)) {
      result.push(script);
    }
  }

  return result;
}
