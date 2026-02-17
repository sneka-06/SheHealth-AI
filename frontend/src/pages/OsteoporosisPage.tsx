import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  Loader2,
  ShieldCheck,
  Bone,
  User,
  Heart,
  Pill,
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
const API_URL =
  import.meta.env.VITE_OSTEOPOROSIS_API_URL || "http://localhost:5002";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface PredictionResult {
  riskLevel: "low" | "moderate" | "high";
  probability: number;
  recommendation: string;
}

// ─── Dropdown field definitions ─────────────────────────────────────────────────
interface DropdownField {
  key: string;       // JSON key sent to API
  label: string;     // Display label
  options: string[]; // Allowed values
  defaultValue?: string; // Pre-selected default
}

const demographicFields: DropdownField[] = [
  { key: "Gender", label: "Gender", options: ["Male", "Female"] },
  {
    key: "Hormonal Changes",
    label: "Hormonal Changes",
    options: ["Normal", "Postmenopausal"],
  },
  { key: "Family History", label: "Family History", options: ["Yes", "No"] },
  {
    key: "Race/Ethnicity",
    label: "Race / Ethnicity",
    options: ["Asian", "Caucasian", "African American"],
  },
  {
    key: "Body Weight",
    label: "Body Weight",
    options: ["Underweight", "Normal"],
  },
];

const lifestyleFields: DropdownField[] = [
  {
    key: "Calcium Intake",
    label: "Calcium Intake",
    options: ["Low", "Adequate"],
  },
  {
    key: "Vitamin D Intake",
    label: "Vitamin D Intake",
    options: ["Sufficient", "Insufficient"],
  },
  {
    key: "Physical Activity",
    label: "Physical Activity",
    options: ["Sedentary", "Active"],
  },
  { key: "Smoking", label: "Smoking", options: ["Yes", "No"] },
  {
    key: "Alcohol Consumption",
    label: "Alcohol Consumption",
    options: ["Moderate", "Unknown"],
    defaultValue: "Unknown",
  },
];

const clinicalFields: DropdownField[] = [
  {
    key: "Medical Conditions",
    label: "Medical Conditions",
    options: ["Rheumatoid Arthritis", "Hyperthyroidism", "Unknown"],
    defaultValue: "Unknown",
  },
  {
    key: "Medications",
    label: "Medications",
    options: ["Corticosteroids", "Unknown"],
    defaultValue: "Unknown",
  },
  {
    key: "Prior Fractures",
    label: "Prior Fractures",
    options: ["Yes", "No"],
  },
];

// ─── Risk‑config for result banner ─────────────────────────────────────────────
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

// All dropdown fields combined (for validation loop)
const allDropdowns = [
  ...demographicFields,
  ...lifestyleFields,
  ...clinicalFields,
];

// ─── Component ──────────────────────────────────────────────────────────────────
const OsteoporosisPage = () => {
  // --- State ---
  const [age, setAge] = useState("");
  const [dropdowns, setDropdowns] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      allDropdowns.map((f) => [f.key, f.defaultValue ?? ""])
    )
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Helpers ---
  const updateDropdown = (key: string, value: string) =>
    setDropdowns((prev) => ({ ...prev, [key]: value }));

  // --- Validation ---
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // Age — required, integer, 1–120
    const ageNum = Number(age);
    if (!age.trim()) e.Age = "Age is required";
    else if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)
      e.Age = "Enter a whole number between 1 and 120";

    // All dropdowns required
    for (const field of allDropdowns) {
      if (!dropdowns[field.key]) {
        e[field.key] = `${field.label} is required`;
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
      const payload: Record<string, string | number> = {
        Age: parseInt(age, 10),
        ...dropdowns,
      };

      const res = await fetch(`${API_URL}/predict/osteoporosis`, {
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
        recommendation: data.diagnosis,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Reusable dropdown renderer ---
  const renderDropdownSection = (
    sectionTitle: string,
    sectionIcon: React.ReactNode,
    fields: DropdownField[]
  ) => (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
        {sectionIcon}
        {sectionTitle}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label
              htmlFor={field.key}
              className="text-sm font-medium text-foreground"
            >
              {field.label}
            </Label>
            <Select
              value={dropdowns[field.key] || ""}
              onValueChange={(v) => updateDropdown(field.key, v)}
            >
              <SelectTrigger id={field.key} className="bg-background">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.key] && (
              <p className="text-xs text-destructive">{errors[field.key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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
            <Bone className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Osteoporosis Risk Detection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Osteoporosis weakens bones, making them fragile and more likely to
            fracture. Our model evaluates demographic, lifestyle, and clinical
            factors to predict your risk level.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            Early detection reduces fracture risk by up to 50% with proper
            treatment
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
            Enter Clinical Parameters
          </h2>

          {/* ── Section 1: Patient Demographics ── */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4" />
              Patient Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Age — the only number input */}
              <div className="space-y-2">
                <Label
                  htmlFor="Age"
                  className="text-sm font-medium text-foreground"
                >
                  Age{" "}
                  <span className="text-muted-foreground ml-1">(years)</span>
                </Label>
                <Input
                  id="Age"
                  type="number"
                  placeholder="e.g. 55"
                  className="bg-background"
                  min={1}
                  max={120}
                  step={1}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                {errors.Age && (
                  <p className="text-xs text-destructive">{errors.Age}</p>
                )}
              </div>

              {/* Demographic dropdowns */}
              {demographicFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label
                    htmlFor={field.key}
                    className="text-sm font-medium text-foreground"
                  >
                    {field.label}
                  </Label>
                  <Select
                    value={dropdowns[field.key] || ""}
                    onValueChange={(v) => updateDropdown(field.key, v)}
                  >
                    <SelectTrigger id={field.key} className="bg-background">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[field.key] && (
                    <p className="text-xs text-destructive">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 2: Lifestyle Factors ── */}
          {renderDropdownSection(
            "Lifestyle Factors",
            <Heart className="w-4 h-4" />,
            lifestyleFields
          )}

          {/* ── Section 3: Clinical History ── */}
          {renderDropdownSection(
            "Clinical History",
            <Pill className="w-4 h-4" />,
            clinicalFields
          )}

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
                {result.probability}% Osteoporosis Probability
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

export default OsteoporosisPage;
