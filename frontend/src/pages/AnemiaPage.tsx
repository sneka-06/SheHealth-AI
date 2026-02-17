import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  Loader2,
  ShieldCheck,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── API URL ────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_ANEMIA_API_URL || "http://localhost:5003";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface PredictionResult {
  riskLevel: "low" | "moderate" | "high";
  probability: number;
  label: string;
  recommendation: string;
}

// ─── Risk config ────────────────────────────────────────────────────────────────
const riskConfig = {
  low: {
    label: "Low Risk",
    color: "bg-success text-success-foreground",
    border: "border-success",
  },
  moderate: {
    label: "Borderline",
    color: "bg-warning text-warning-foreground",
    border: "border-warning",
  },
  high: {
    label: "High Risk",
    color: "bg-destructive text-destructive-foreground",
    border: "border-destructive",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────────
const AnemiaPage = () => {
  // --- State ---
  const [gender, setGender] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [mch, setMch] = useState("");
  const [mchc, setMchc] = useState("");
  const [mcv, setMcv] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Validation ---
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!gender) e.gender = "Please select gender";

    const numFields: {
      key: string;
      value: string;
      label: string;
      min: number;
      max: number;
    }[] = [
        { key: "hemoglobin", value: hemoglobin, label: "Hemoglobin", min: 2.0, max: 25.0 },
        { key: "mch", value: mch, label: "MCH", min: 10.0, max: 50.0 },
        { key: "mchc", value: mchc, label: "MCHC", min: 20.0, max: 45.0 },
        { key: "mcv", value: mcv, label: "MCV", min: 50.0, max: 150.0 },
      ];

    for (const f of numFields) {
      if (!f.value.trim()) {
        e[f.key] = `${f.label} is required`;
      } else {
        const n = parseFloat(f.value);
        if (isNaN(n)) e[f.key] = "Must be a number";
        else if (n < f.min || n > f.max)
          e[f.key] = `Must be between ${f.min} and ${f.max}`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Predict ---
  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setApiError(null);

    try {
      const payload = {
        Gender: parseInt(gender, 10),
        Hemoglobin: parseFloat(hemoglobin),
        MCH: parseFloat(mch),
        MCHC: parseFloat(mchc),
        MCV: parseFloat(mcv),
      };

      const res = await fetch(`${API_URL}/predict/anemia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      const riskMap: Record<string, PredictionResult["riskLevel"]> = {
        Low: "low",
        Borderline: "moderate",
        High: "high",
      };

      setResult({
        riskLevel: riskMap[data.risk_level] || "moderate",
        probability: Math.round(data.probability * 100),
        label: data.prediction_label,
        recommendation:
          data.prediction_label === "Anemic"
            ? "The analysis suggests signs of anemia. Please consult a healthcare professional for confirmation and treatment options. Common treatments include iron supplements and dietary changes."
            : "The analysis does not indicate anemia. Continue maintaining a balanced diet rich in iron, vitamin B12, and folate for healthy blood cell production.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* ───── Header ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 text-primary">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Anemia Detection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Anemia occurs when your blood lacks enough healthy red blood cells.
            Our model uses hematological parameters from a standard CBC report to
            evaluate your risk of anemia.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            Untreated anemia can lead to severe fatigue, pregnancy
            complications, and heart problems
          </div>
        </motion.div>

        {/* ───── Form ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card mb-8"
        >
          <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Enter CBC Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Gender */}
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-sm font-medium text-foreground"
              >
                Gender / Sex
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender" className="bg-background">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="0">Female</SelectItem>
                  <SelectItem value="1">Male</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>

            {/* Hemoglobin */}
            <div className="space-y-2">
              <Label
                htmlFor="hemoglobin"
                className="text-sm font-medium text-foreground"
              >
                Hemoglobin{" "}
                <span className="text-muted-foreground ml-1">(g/dL)</span>
              </Label>
              <Input
                id="hemoglobin"
                type="number"
                placeholder="Normal: 12.0 – 17.5 g/dL"
                className="bg-background"
                min={2.0}
                max={25.0}
                step={0.1}
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
              />
              {errors.hemoglobin && (
                <p className="text-xs text-destructive">{errors.hemoglobin}</p>
              )}
            </div>

            {/* MCH */}
            <div className="space-y-2">
              <Label
                htmlFor="mch"
                className="text-sm font-medium text-foreground"
              >
                MCH{" "}
                <span className="text-muted-foreground ml-1">(pg)</span>
              </Label>
              <Input
                id="mch"
                type="number"
                placeholder="Normal: 27.0 – 33.0 pg"
                className="bg-background"
                min={10.0}
                max={50.0}
                step={0.1}
                value={mch}
                onChange={(e) => setMch(e.target.value)}
              />
              {errors.mch && (
                <p className="text-xs text-destructive">{errors.mch}</p>
              )}
            </div>

            {/* MCHC */}
            <div className="space-y-2">
              <Label
                htmlFor="mchc"
                className="text-sm font-medium text-foreground"
              >
                MCHC{" "}
                <span className="text-muted-foreground ml-1">(g/dL)</span>
              </Label>
              <Input
                id="mchc"
                type="number"
                placeholder="Normal: 32.0 – 36.0 g/dL"
                className="bg-background"
                min={20.0}
                max={45.0}
                step={0.1}
                value={mchc}
                onChange={(e) => setMchc(e.target.value)}
              />
              {errors.mchc && (
                <p className="text-xs text-destructive">{errors.mchc}</p>
              )}
            </div>

            {/* MCV */}
            <div className="space-y-2">
              <Label
                htmlFor="mcv"
                className="text-sm font-medium text-foreground"
              >
                MCV{" "}
                <span className="text-muted-foreground ml-1">(fL)</span>
              </Label>
              <Input
                id="mcv"
                type="number"
                placeholder="Normal: 80.0 – 100.0 fL"
                className="bg-background"
                min={50.0}
                max={150.0}
                step={0.1}
                value={mcv}
                onChange={(e) => setMcv(e.target.value)}
              />
              {errors.mcv && (
                <p className="text-xs text-destructive">{errors.mcv}</p>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handlePredict}
              disabled={loading}
              size="lg"
              className="bg-hero-gradient text-primary-foreground px-8 shadow-hero hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Predict Risk"
              )}
            </Button>
          </div>
        </motion.div>

        {/* ───── API Error ───── */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-8 flex gap-3 items-start"
          >
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive mb-1">
                Prediction Failed
              </p>
              <p className="text-xs text-destructive/80 leading-relaxed">
                {apiError}
              </p>
            </div>
          </motion.div>
        )}

        {/* ───── Result ───── */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-card rounded-2xl border-2 ${riskConfig[result.riskLevel].border} p-6 md:p-8 shadow-card mb-8`}
          >
            <div className="text-center">
              <div className="animate-pulse-glow inline-block rounded-2xl p-1 mb-4">
                <div
                  className={`px-6 py-2 rounded-xl text-sm font-bold ${riskConfig[result.riskLevel].color}`}
                >
                  {riskConfig[result.riskLevel].label}
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground mb-2">
                {result.probability}% Anemia Probability
              </p>
              <p className="text-base font-semibold text-foreground/80 mb-2">
                Result: {result.label}
              </p>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm mt-4">
                {result.recommendation}
              </p>
            </div>
          </motion.div>
        )}

        {/* ───── Disclaimer ───── */}
        <div className="bg-accent/50 rounded-xl border border-border p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Medical Disclaimer
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This prediction tool is for educational and early screening
              purposes only. Results are generated by a machine learning model
              and should not be treated as a medical diagnosis. Please consult a
              qualified healthcare professional for clinical evaluation and
              treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnemiaPage;
