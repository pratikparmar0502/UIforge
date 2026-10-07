import { unlink } from 'node:fs/promises';

export async function removeUploadedFile(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to remove uploaded screenshot:', error.message);
    }
  }
}
