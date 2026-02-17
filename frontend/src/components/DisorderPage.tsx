import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Activity, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FormField {
  name: string;
  label: string;
  type: "number" | "select" | "text";
  placeholder?: string;
  options?: { label: string; value: string }[];
  unit?: string;
  min?: number;
  max?: number;
}

interface PredictionResult {
  riskLevel: "low" | "moderate" | "high";
  probability: number;
  recommendation: string;
}

interface DisorderPageProps {
  title: string;
  description: string;
  whyItMatters: string;
  fields: FormField[];
  icon: React.ReactNode;
}

const riskConfig = {
  low: { label: "Low Risk", color: "bg-success text-success-foreground", border: "border-success" },
  moderate: { label: "Borderline", color: "bg-warning text-warning-foreground", border: "border-warning" },
  high: { label: "High Risk", color: "bg-destructive text-destructive-foreground", border: "border-destructive" },
};

const DisorderPage = ({ title, description, whyItMatters, fields, icon }: DisorderPageProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const val = formData[field.name];
      if (!val || val.trim() === "") {
        newErrors[field.name] = "This field is required";
      } else if (field.type === "number") {
        const num = parseFloat(val);
        if (isNaN(num)) newErrors[field.name] = "Must be a number";
        else if (field.min !== undefined && num < field.min) newErrors[field.name] = `Min value is ${field.min}`;
        else if (field.max !== undefined && num > field.max) newErrors[field.name] = `Max value is ${field.max}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePredict = async () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);

    try {
      // Send form values to Flask API
      const payload: Record<string, number> = {};
      for (const field of fields) {
        payload[field.name] = parseFloat(formData[field.name]);
      }

      const res = await fetch("http://localhost:5000/predict/pcos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Prediction failed");
      }

      const data = await res.json();

      // Map API response to frontend PredictionResult
      const riskMap: Record<string, PredictionResult["riskLevel"]> = {
        Low: "low",
        Borderline: "moderate",
        High: "high",
      };

      const predictionResult: PredictionResult = {
        riskLevel: riskMap[data.risk_level] || "moderate",
        probability: Math.round(data.probability * 100),
        recommendation: data.diagnosis,
      };

      setResult(predictionResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 text-primary">
            {icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
            <ShieldCheck className="w-3.5 h-3.5" />
            {whyItMatters}
          </div>
        </motion.div>

        {/* Form */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                  {field.label}
                  {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
                </Label>
                {field.type === "select" ? (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(v) => setFormData((p) => ({ ...p, [field.name]: v }))}
                  >
                    <SelectTrigger id={field.name} className="bg-background">
                      <SelectValue placeholder={field.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border z-50">
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-background"
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                    aria-label={field.label}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-xs text-destructive">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

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

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-card rounded-2xl border-2 ${riskConfig[result.riskLevel].border} p-6 md:p-8 shadow-card mb-8`}
          >
            <div className="text-center">
              <div className="animate-pulse-glow inline-block rounded-2xl p-1 mb-4">
                <div className={`px-6 py-2 rounded-xl text-sm font-bold ${riskConfig[result.riskLevel].color}`}>
                  {riskConfig[result.riskLevel].label}
                </div>
              </div>
              <p className="text-3xl font-display font-bold text-foreground mb-2">
                {result.probability}% PCOS Probability
              </p>
              <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm mt-4">
                {result.recommendation}
              </p>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="bg-accent/50 rounded-xl border border-border p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Medical Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This prediction tool is for educational and early screening purposes only. Results are generated by a machine learning model and should not be treated as a medical diagnosis. Please consult a qualified healthcare professional for clinical evaluation and treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisorderPage;
