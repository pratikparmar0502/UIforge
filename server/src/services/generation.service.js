import Generation from '../models/Generation.js';

export const GENERATION_STATUS = {
  pending: 'pending',
  analyzing: 'analyzing',
  analyzed: 'analyzed',
  failed: 'failed',
};

export function createPendingGeneration(generationData) {
  return Generation.create({
    ...generationData,
    status: GENERATION_STATUS.pending,
  });
}

export function markGenerationAnalyzing(id) {
  return Generation.findOneAndUpdate(
    { _id: id, status: { $ne: GENERATION_STATUS.analyzing } },
    {
      $set: { status: GENERATION_STATUS.analyzing },
      $unset: { analysisError: 1 },
    },
    { new: true },
  );
}

export function markGenerationAnalyzed(id, { uiSpecification, prompt, model }) {
  return Generation.findByIdAndUpdate(
    id,
    {
      $set: {
        uiSpecification,
        prompt,
        model,
        status: GENERATION_STATUS.analyzed,
      },
      $unset: { analysisError: 1 },
    },
    { new: true },
  );
}

export function markGenerationFailed(id, { analysisError, prompt, model }) {
  const update = {
    status: GENERATION_STATUS.failed,
    analysisError,
  };

  if (prompt) {
    update.prompt = prompt;
  }

  if (model) {
    update.model = model;
  }

  return Generation.findByIdAndUpdate(id, { $set: update }, { new: true });
}
