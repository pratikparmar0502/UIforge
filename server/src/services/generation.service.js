import Generation from "../models/Generation.js";

export const GENERATION_STATUS = {
  pending: "pending",
  analyzing: "analyzing",
  analyzed: "analyzed",
  generating: "generating",
  completed: "completed",
  failed: "failed",
};

// --------------------------------------------------
// M03: Create a new pending generation
// --------------------------------------------------
export function createPendingGeneration({ projectId, screenshot, framework, styling }) {
  return Generation.create({
    projectId,
    screenshot,
    framework: framework || "react",
    styling: styling || "tailwind",
    status: GENERATION_STATUS.pending,
  });
}

// --------------------------------------------------
// M04: Lock generation for AI screenshot analysis
// --------------------------------------------------
export function markGenerationAnalyzing(id) {
  return Generation.findOneAndUpdate(
    {
      _id: id,
      status: {
        $nin: [GENERATION_STATUS.analyzing, GENERATION_STATUS.generating],
      },
    },
    {
      $set: {
        status: GENERATION_STATUS.analyzing,
      },
      $unset: {
        analysisError: 1,
      },
    },
    {
      new: true,
    },
  );
}

// --------------------------------------------------
// M04: Save successful screenshot analysis
// --------------------------------------------------
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
      $unset: {
        analysisError: 1,
      },
    },
    {
      new: true,
    },
  );
}

// --------------------------------------------------
// M04: Mark analysis/generation as failed
// --------------------------------------------------
export function markGenerationFailed(id, { analysisError, prompt, model }) {
  const set = {
    status: GENERATION_STATUS.failed,
    analysisError,
  };

  if (prompt) {
    set.prompt = prompt;
  }

  if (model) {
    set.model = model;
  }

  return Generation.findByIdAndUpdate(
    id,
    {
      $set: set,
    },
    {
      new: true,
    },
  );
}

// --------------------------------------------------
// M05: Atomic lock for code generation
// --------------------------------------------------
export function markGenerationGenerating(id) {
  return Generation.findOneAndUpdate(
    {
      _id: id,

      // Don't allow two AI operations at the same time.
      status: {
        $nin: [GENERATION_STATUS.analyzing, GENERATION_STATUS.generating],
      },

      // Code generation requires an existing UI specification.
      uiSpecification: {
        $exists: true,
        $ne: null,
      },
    },
    {
      $set: {
        status: GENERATION_STATUS.generating,
      },
      $unset: {
        analysisError: 1,
      },
    },
    {
      new: true,
    },
  );
}

// --------------------------------------------------
// M05: Save successfully generated React code
// --------------------------------------------------
export function markGenerationCompleted(id, { generatedCode, model }) {
  const set = {
    generatedCode,
    status: GENERATION_STATUS.completed,
  };

  if (model) {
    set.model = model;
  }

  return Generation.findByIdAndUpdate(
    id,
    {
      $set: set,
      $unset: {
        analysisError: 1,
      },
    },
    {
      new: true,
    },
  );
}
