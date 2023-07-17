import { ProjectFile } from '@/types';

/**
 * Get file extension. Will strip extended extensions
 *
 * @param {ProjectFile} file project file
 * @returns {string} file extension
 */
export function getFileExtension(file: ProjectFile): string {
  return file.name.split('.').pop() as string;
}
