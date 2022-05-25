import { ProjectFile } from '@/types';

/**
 * Get file extension. Will strip extended extensions
 *
 * @param {ProjectFile} file project file
 * @returns {string} file extension
 */
export function getFileExtension(file: ProjectFile): string {
  let ext = file.name.split('.').pop() as string;
  if (ext.endsWith('x')) {
    ext = ext.slice(0, ext.length - 1);
  }

  return ext;
}
