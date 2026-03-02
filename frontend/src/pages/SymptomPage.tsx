import { useState } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Stethoscope, ArrowRight, Activity, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

interface DiseaseSuggestion {
    id: string;
    name: string;
    path: string;
    matchScore: number;
}

const symptomsList = [
    { id: "irregular_periods", label: "Irregular or missed periods", disorders: ["pcos", "thyroid"] },
    { id: "fatigue", label: "Extreme fatigue or tiredness", disorders: ["anemia", "thyroid"] },
    { id: "hair_changes", label: "Hair thinning or excessive growth", disorders: ["pcos", "thyroid"] },
    { id: "weight_changes", label: "Unexplained weight gain/loss", disorders: ["pcos", "thyroid"] },
    { id: "skin_changes", label: "Pale skin, acne, or unusual rashes", disorders: ["anemia", "pcos", "breast-cancer"] },
    { id: "pain", label: "Back pain or bone/joint aches", disorders: ["osteoporosis"] },
    { id: "lumps", label: "Noticeable lumps or skin pitting", disorders: ["breast-cancer"] },
    { id: "shortness_breath", label: "Shortness of breath or dizziness", disorders: ["anemia"] },
    { id: "temperature_sensitivity", label: "Sensitivity to cold or heat", disorders: ["thyroid"] },
];

const diseaseInfo: Record<string, { name: string; path: string }> = {
    pcos: { name: "PCOS Detection", path: "/pcos" },
    anemia: { name: "Anemia Detection", path: "/anemia" },
    thyroid: { name: "Thyroid Disorder", path: "/thyroid" },
    osteoporosis: { name: "Osteoporosis Risk", path: "/osteoporosis" },
    "breast-cancer": { name: "Breast Cancer Risk", path: "/breast-cancer" },
};

const SymptomPage = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<DiseaseSuggestion[]>([]);
    const [hasChecked, setHasChecked] = useState(false);

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleDetect = () => {
        const scores: Record<string, number> = {};

        selectedSymptoms.forEach((sId) => {
            const symptom = symptomsList.find((s) => s.id === sId);
            if (symptom) {
                symptom.disorders.forEach((dId) => {
                    scores[dId] = (scores[dId] || 0) + 1;
                });
            }
        });

        const results = Object.entries(scores)
            .map(([id, score]) => ({
                id,
                name: diseaseInfo[id].name,
                path: diseaseInfo[id].path,
                matchScore: score,
            }))
            .sort((a, b) => b.matchScore - a.matchScore);

        setSuggestions(results);
        setHasChecked(true);
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 text-primary">
                        <Stethoscope className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                        Symptom-Based Pre-Screening
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Unsure which screening to take? Select the symptoms you're experiencing, and our system will recommend the most relevant clinical tests.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-medium text-accent-foreground">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Triage logic reduces incorrect model usage and improves clinical focus
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card mb-8"
                >
                    <h2 className="text-lg font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        Select Your Symptoms
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {symptomsList.map((symptom) => (
                            <label
                                key={symptom.id}
                                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-accent/40 transition-all cursor-pointer select-none group"
                            >
                                <Checkbox
                                    checked={selectedSymptoms.includes(symptom.id)}
                                    onCheckedChange={() => toggleSymptom(symptom.id)}
                                />
                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                    {symptom.label}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <Button
                            onClick={handleDetect}
                            size="lg"
                            className="bg-hero-gradient text-primary-foreground px-10 shadow-hero hover:opacity-90 transition-opacity"
                            disabled={selectedSymptoms.length === 0}
                        >
                            Detect Potential Risks
                        </Button>
                    </div>
                </motion.div>

                {hasChecked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-display font-bold text-foreground flex items-center justify-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Recommended Screenings
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Based on your symptoms, we suggest completing the following evaluations:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {suggestions.length > 0 ? (
                                suggestions.map((s) => (
                                    <Link
                                        key={s.id}
                                        to={s.path}
                                        className="group bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                                                {s.matchScore} Match Factors
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-4">{s.name}</h4>
                                        <span className="text-primary text-xs font-bold flex items-center gap-1 mt-auto">
                                            Go to Screening <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full p-8 text-center bg-accent/30 rounded-2xl border border-dashed border-border text-muted-foreground">
                                    No specific disorder matches found for these symptoms. If you remain concerned, we recommend general clinical consultation.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SymptomPage;
