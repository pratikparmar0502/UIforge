import Generation from '../models/Generation.js';

export function createPendingGeneration(generationData) {
  return Generation.create({
    ...generationData,
    status: 'pending',
  });
}
