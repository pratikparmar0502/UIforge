import React, { useEffect, useState, useRef } from "react";
import { analyzeGeneration, createGeneration } from "./services/api";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);

  // Release each preview URL when the selected preview changes or the component unmounts.
  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (file) => {
    setError(null);
    setGenerationResult(null);
    setAnalysisResult(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG, JPEG, or WebP screenshot.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setGenerationResult(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a screenshot file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await createGeneration(selectedFile);
      // The backend controller returns { message, generation: { id, ... } }.
      const id = response?.generation?.id;

      if (typeof id !== "string" || id.trim() === "") {
        throw new Error("The upload response did not contain a valid generation ID.");
      }

      setGenerationResult({ id });
    } catch (err) {
      setError(err?.message || "Failed to upload screenshot.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!generationResult?.id) {
      setError("Upload a screenshot before starting AI analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await analyzeGeneration(generationResult.id);
      const specification = response?.generation?.uiSpecification;

      if (!specification || typeof specification !== "object") {
        throw new Error(
          "Analysis completed, but the response did not contain a valid UI specification.",
        );
      }

      setAnalysisResult({
        specification,
        status: response?.generation?.status || "analyzed",
        model: response?.generation?.model || null,
      });
    } catch (err) {
      setError(err?.message || "AI screenshot analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white">
            U
          </div>
          <span className="text-xl font-bold tracking-tight text-white">UIForge</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          M06.3 • AI Screenshot Analysis
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Transform Screenshots into Code
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Upload your UI mockup or screenshot to initialize the generation pipeline.
          </p>
        </div>

        {/* Upload Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-indigo-500 bg-indigo-500/5"
                  : "border-slate-700 hover:border-slate-500 bg-slate-950/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                📁
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500">Supported formats: PNG, JPG, WebP</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Box */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 max-h-96 flex items-center justify-center p-2">
                <img
                  src={previewUrl}
                  alt="Screenshot Preview"
                  className="max-h-80 w-auto object-contain rounded"
                />
                <button
                  onClick={clearSelection}
                  disabled={isLoading}
                  className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-slate-300 p-2 rounded-full border border-slate-700 transition"
                  title="Remove screenshot"
                >
                  ✕
                </button>
              </div>

              {/* File Info & Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="truncate mr-4">
                  <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white font-medium text-sm rounded-lg transition flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Screenshot</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {generationResult && (
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm space-y-1">
              <p className="font-semibold">Upload Successful!</p>
              <p className="text-xs text-emerald-300/80">
                Generation ID:{" "}
                <code className="bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-200 font-mono">
                  {generationResult.id}
                </code>
              </p>
            </div>
          )}

          {generationResult && !analysisResult && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Next, let AI inspect the screenshot and build a structured UI specification.
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || isLoading}
                className="shrink-0 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Analyzing screenshot...
                  </span>
                ) : (
                  "Analyze Screenshot with AI"
                )}
              </button>
            </div>
          )}

          {analysisResult && (
            <section className="mt-6 space-y-4" aria-live="polite">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="font-semibold text-emerald-400">AI analysis completed</p>
                <p className="mt-1 text-sm text-emerald-200/80">
                  Status: {analysisResult.status}
                  {analysisResult.model ? ` · Model: ${analysisResult.model}` : ""}
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
                <h2 className="text-lg font-semibold text-slate-100">UI Analysis Results</h2>
                {analysisResult.specification.page && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Page type
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      {analysisResult.specification.page.type || "Not identified"}
                    </p>
                    {analysisResult.specification.page.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {analysisResult.specification.page.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-900 p-3">
                    <p className="text-xs text-slate-400">Sections</p>
                    <p className="mt-1 text-xl font-semibold text-slate-100">
                      {Array.isArray(analysisResult.specification.sections)
                        ? analysisResult.specification.sections.length
                        : 0}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-900 p-3">
                    <p className="text-xs text-slate-400">Components</p>
                    <p className="mt-1 text-xl font-semibold text-slate-100">
                      {Array.isArray(analysisResult.specification.components)
                        ? analysisResult.specification.components.length
                        : 0}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-900 p-3">
                    <p className="text-xs text-slate-400">Visible text items</p>
                    <p className="mt-1 text-xl font-semibold text-slate-100">
                      {Array.isArray(analysisResult.specification.content)
                        ? analysisResult.specification.content.length
                        : 0}
                    </p>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-cyan-400 hover:text-cyan-300">
                    View full UI specification (JSON)
                  </summary>
                  <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-slate-800 bg-slate-900 p-3 text-xs leading-5 text-slate-300">
                    {JSON.stringify(analysisResult.specification, null, 2)}
                  </pre>
                </details>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
