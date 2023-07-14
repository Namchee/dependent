import { resolveDependencyPackageJSON, resolvePackageJSON } from '@/service/package';

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
  const { executables } = resolveDependencyPackageJSON(dependency);

  const pattern = `(${Object.keys(executables).join('|')})`;

  const result = [];

  for (const [script, value] of Object.entries(scripts)) {
    if (value.match(pattern)) {
      result.push(script);
    }
  }

  return result;
}
