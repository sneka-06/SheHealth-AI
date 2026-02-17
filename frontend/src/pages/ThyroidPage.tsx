import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  Loader2,
  ShieldCheck,
  Brain,
  User,
  FlaskConical,
  ClipboardList,
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
import { Checkbox } from "@/components/ui/checkbox";

// ─── API URL ────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_THYROID_API_URL || "http://localhost:5001";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface PredictionResult {
  riskLevel: "low" | "moderate" | "high";
  probability: number;
  recommendation: string;
}

// ─── Medical‑history checkbox definitions ───────────────────────────────────────
const medicalHistoryFields = [
  { key: "on thyroxine", label: "On thyroxine medication?" },
  { key: "query on thyroxine", label: "Query on thyroxine?" },
  { key: "on antithyroid medication", label: "On antithyroid medication?" },
  { key: "sick", label: "Currently sick?" },
  { key: "pregnant", label: "Pregnant?" },
  { key: "thyroid surgery", label: "Had thyroid surgery?" },
  { key: "I131 treatment", label: "Had I131 treatment?" },
  { key: "query hypothyroid", label: "Query hypothyroid?" },
  { key: "query hyperthyroid", label: "Query hyperthyroid?" },
  { key: "lithium", label: "On lithium?" },
  { key: "goitre", label: "Has goitre?" },
  { key: "tumor", label: "Has tumor?" },
  { key: "hypopituitary", label: "Hypopituitary?" },
  { key: "psych", label: "Psychiatric condition?" },
] as const;

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

// ─── Component ──────────────────────────────────────────────────────────────────
const ThyroidPage = () => {
  // --- State ---
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [tsh, setTsh] = useState("");
  const [tt4, setTt4] = useState("");
  const [t4u, setT4u] = useState("");
  const [fti, setFti] = useState("");

  // All 14 checkboxes default to unchecked (false → 0)
  const [history, setHistory] = useState<Record<string, boolean>>(
    Object.fromEntries(medicalHistoryFields.map((f) => [f.key, false]))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- Validation ---
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // Age — required, integer, 1–120
    const ageNum = Number(age);
    if (!age.trim()) e.age = "Age is required";
    else if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120)
      e.age = "Enter a whole number between 1 and 120";

    // Sex
    if (!sex) e.sex = "Please select sex";

    // Lab values — required, ≥ 0
    const labFields = [
      { key: "tsh", value: tsh, label: "TSH" },
      { key: "tt4", value: tt4, label: "TT4" },
      { key: "t4u", value: t4u, label: "T4U" },
      { key: "fti", value: fti, label: "FTI" },
    ];
    for (const lab of labFields) {
      if (!lab.value.trim()) {
        e[lab.key] = `${lab.label} is required`;
      } else {
        const n = parseFloat(lab.value);
        if (isNaN(n)) e[lab.key] = "Must be a number";
        else if (n < 0) e[lab.key] = "Cannot be negative";
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
      const payload: Record<string, number> = {
        // Patient info
        age: parseInt(age, 10),
        sex: parseInt(sex, 10),

        // Lab tests
        TSH: parseFloat(tsh),
        TT4: parseFloat(tt4),
        T4U: parseFloat(t4u),
        FTI: parseFloat(fti),

        // Medical history — 0 or 1
        ...Object.fromEntries(
          medicalHistoryFields.map((f) => [f.key, history[f.key] ? 1 : 0])
        ),

        // Auto‑filled hidden flags
        was_imputed_TSH: 0,
        was_imputed_TT4: 0,
        was_imputed_T4U: 0,
        was_imputed_FTI: 0,
      };

      const res = await fetch(`${API_URL}/predict/thyroid`, {
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
            <Brain className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Thyroid Disorder Detection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Thyroid disorders affect hormone production from the thyroid gland.
            Our model screens for both hypothyroidism and hyperthyroidism using
            key thyroid function markers.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            Thyroid dysfunction affects metabolism, energy levels, and
            reproductive health
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

          {/* ── Section 1: Patient Info ── */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-foreground">
                  Age <span className="text-muted-foreground ml-1">(years)</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 35"
                  className="bg-background"
                  min={1}
                  max={120}
                  step={1}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                {errors.age && (
                  <p className="text-xs text-destructive">{errors.age}</p>
                )}
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm font-medium text-foreground">
                  Sex
                </Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger id="sex" className="bg-background">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="0">Female</SelectItem>
                    <SelectItem value="1">Male</SelectItem>
                  </SelectContent>
                </Select>
                {errors.sex && (
                  <p className="text-xs text-destructive">{errors.sex}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Lab Tests ── */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
              <FlaskConical className="w-4 h-4" />
              Lab Test Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* TSH */}
              <div className="space-y-2">
                <Label htmlFor="tsh" className="text-sm font-medium text-foreground">
                  TSH <span className="text-muted-foreground ml-1">(mIU/L)</span>
                </Label>
                <Input
                  id="tsh"
                  type="number"
                  placeholder="Normal: 0.4 – 4.0 mIU/L"
                  className="bg-background"
                  min={0}
                  step="any"
                  value={tsh}
                  onChange={(e) => setTsh(e.target.value)}
                />
                {errors.tsh && (
                  <p className="text-xs text-destructive">{errors.tsh}</p>
                )}
              </div>

              {/* TT4 */}
              <div className="space-y-2">
                <Label htmlFor="tt4" className="text-sm font-medium text-foreground">
                  TT4 (Total T4){" "}
                  <span className="text-muted-foreground ml-1">(nmol/L)</span>
                </Label>
                <Input
                  id="tt4"
                  type="number"
                  placeholder="Normal: 60 – 150 nmol/L"
                  className="bg-background"
                  min={0}
                  step="any"
                  value={tt4}
                  onChange={(e) => setTt4(e.target.value)}
                />
                {errors.tt4 && (
                  <p className="text-xs text-destructive">{errors.tt4}</p>
                )}
              </div>

              {/* T4U */}
              <div className="space-y-2">
                <Label htmlFor="t4u" className="text-sm font-medium text-foreground">
                  T4U (T4 Uptake)
                </Label>
                <Input
                  id="t4u"
                  type="number"
                  placeholder="Normal: 0.7 – 1.2"
                  className="bg-background"
                  min={0}
                  step="any"
                  value={t4u}
                  onChange={(e) => setT4u(e.target.value)}
                />
                {errors.t4u && (
                  <p className="text-xs text-destructive">{errors.t4u}</p>
                )}
              </div>

              {/* FTI */}
              <div className="space-y-2">
                <Label htmlFor="fti" className="text-sm font-medium text-foreground">
                  FTI (Free Thyroxine Index)
                </Label>
                <Input
                  id="fti"
                  type="number"
                  placeholder="Normal: 60 – 160"
                  className="bg-background"
                  min={0}
                  step="any"
                  value={fti}
                  onChange={(e) => setFti(e.target.value)}
                />
                {errors.fti && (
                  <p className="text-xs text-destructive">{errors.fti}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 3: Medical History ── */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
              <ClipboardList className="w-4 h-4" />
              Medical History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicalHistoryFields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/40 transition-colors cursor-pointer select-none"
                >
                  <Checkbox
                    id={field.key}
                    checked={history[field.key]}
                    onCheckedChange={(checked) =>
                      setHistory((prev) => ({
                        ...prev,
                        [field.key]: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">{field.label}</span>
                </label>
              ))}
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
                {result.probability}% Thyroid Disorder Probability
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

export default ThyroidPage;
