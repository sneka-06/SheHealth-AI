

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Ribbon,
  Upload,
  ImagePlus,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PredictionResult {
  riskLevel: "low" | "moderate" | "high" | "unknown";
  probability: number;
  classification: string;
  recommendation: string;
}

const riskConfig = {
  low: {
    label: "Normal",
    color: "bg-success text-success-foreground",
    border: "border-success",
    glow: "shadow-[0_0_24px_-4px_hsl(142_72%_42%/0.3)]",
  },
  moderate: {
    label: "Benign",
    color: "bg-warning text-warning-foreground",
    border: "border-warning",
    glow: "shadow-[0_0_24px_-4px_hsl(38_92%_55%/0.3)]",
  },
  high: {
    label: "Malignant",
    color: "bg-destructive text-destructive-foreground",
    border: "border-destructive",
    glow: "shadow-[0_0_24px_-4px_hsl(0_72%_55%/0.3)]",
  },
  unknown: {
    label: "Invalid Image",
    color: "bg-muted text-muted-foreground",
    border: "border-muted",
    glow: "",
  },
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const BreastCancerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── helpers ── */
  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };

  const processFile = useCallback((f: File) => {
    setError(null);
    setResult(null);

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError("Unsupported file format. Please upload a PNG, JPEG, WebP, BMP, or TIFF image.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  /* ── drag events ── */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) processFile(droppedFile);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) processFile(selected);
    },
    [processFile]
  );

  /* ── prediction ── */
  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const res = await fetch("http://localhost:5004/predict/breast-cancer", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Prediction failed");
      }

      const data = await res.json();

      const riskMap: Record<string, PredictionResult["riskLevel"]> = {
        Low: "low",
        Borderline: "moderate",
        High: "high",
        "Invalid Input": "unknown",
      };

      const predictionResult: PredictionResult = {
        riskLevel: riskMap[data.risk_level] || "unknown",
        probability: Math.round(data.probability * 100),
        classification: data.classification || "—",
        recommendation: data.diagnosis || data.recommendation || "",
      };

      setResult(predictionResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 text-primary">
            <Ribbon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Breast Cancer Ultrasound Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload a breast ultrasound image and our deep learning model will analyze it to
            classify the tissue as benign, malignant, or normal — aiding in early detection.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            When detected early, the 5-year survival rate for breast cancer exceeds 99%
          </div>
        </motion.div>

        {/* ── Upload Area ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card mb-8"
        >
          <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" />
            Upload Ultrasound Image
          </h2>

          <AnimatePresence mode="wait">
            {!preview ? (
              /* ── Drop Zone ── */
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
                  flex flex-col items-center justify-center py-16 md:py-20 gap-4
                  ${dragActive
                    ? "border-primary bg-accent/60 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
                  }
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <motion.div
                  animate={dragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-primary"
                >
                  {dragActive ? (
                    <ImagePlus className="w-8 h-8" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </motion.div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {dragActive ? "Drop your image here" : "Drag & drop your ultrasound image"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or{" "}
                    <span className="text-primary font-medium underline underline-offset-2">
                      click to browse
                    </span>
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  PNG, JPEG, WebP, BMP, TIFF — Max 10 MB
                </p>
              </motion.div>
            ) : (
              /* ── Preview ── */
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Image preview */}
                  <div className="relative group w-full md:w-1/2 rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={preview}
                      alt="Ultrasound preview"
                      className="w-full h-64 md:h-72 object-contain bg-black/5"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/80 backdrop-blur border border-border
                                 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File info + action */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {file?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file ? (file.size / 1024).toFixed(1) + " KB" : ""}
                        {" · "}
                        {file?.type.split("/")[1].toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready for analysis
                      </div>
                    </div>

                    {loading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          {uploadProgress < 90 ? "Uploading…" : "Analyzing image…"}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={handlePredict}
                        disabled={loading}
                        size="lg"
                        className="flex-1 bg-hero-gradient text-primary-foreground shadow-hero hover:opacity-90 transition-opacity"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <Ribbon className="w-4 h-4 mr-2" />
                            Analyze Image
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={resetState}
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* ── Result ── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-card rounded-2xl border-2 ${riskConfig[result.riskLevel].border} ${riskConfig[result.riskLevel].glow} p-6 md:p-8 shadow-card mb-8`}
          >
            <div className="text-center">
              <div className="animate-pulse-glow inline-block rounded-2xl p-1 mb-4">
                <div
                  className={`px-6 py-2 rounded-xl text-sm font-bold ${riskConfig[result.riskLevel].color}`}
                >
                  {riskConfig[result.riskLevel].label}
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground mb-1">
                {result.probability}% Probability
              </p>
              <p className="text-base font-medium text-foreground/80 mb-4">
                Classification: {result.classification}
              </p>
              {result.recommendation && (
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm">
                  {result.recommendation}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Disclaimer ── */}
        <div className="bg-accent/50 rounded-xl border border-border p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Medical Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This prediction tool is for educational and early screening purposes only. Results
              are generated by a deep learning model trained on ultrasound imagery and should not
              be treated as a medical diagnosis. Please consult a qualified healthcare
              professional for clinical evaluation and treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreastCancerPage;
