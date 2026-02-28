import DisorderPage, { FormField } from "@/components/DisorderPage";
import { HeartPulse } from "lucide-react";

const fields: FormField[] = [
  { name: "age", label: "Age", type: "number", placeholder: "e.g. 28", unit: "years", min: 10, max: 60 },
  { name: "bmi", label: "BMI", type: "number", placeholder: "e.g. 24.5", unit: "kg/m²", min: 10, max: 60 },
  { name: "menstrual_irregularity", label: "Menstrual Irregularity", type: "select", options: [{ label: "Yes", value: "1" }, { label: "No", value: "0" }] },
  { name: "testosterone_level", label: "Testosterone Level", type: "number", placeholder: "e.g. 45", unit: "ng/dL", min: 0, max: 200 },
  { name: "antral_follicle_count", label: "Antral Follicle Count", type: "number", placeholder: "e.g. 12", min: 0, max: 40 },
];

const pcosAdvice = {
  low: [
    "Maintain a balanced diet and regular physical activity to support hormonal health.",
    "Monitor your menstrual cycle for any sudden changes or irregularities.",
    "No immediate clinical action required; consult a doctor if you notice unusual hair growth or acne."
  ],
  moderate: [
    "Consider tracking your symptoms closely and maintaining a health diary.",
    "Schedule a consultation with a gynecologist or endocrinologist for a professional hormonal evaluation.",
    "Maintain a low-glycemic diet and regular exercise to manage metabolic markers."
  ],
  high: [
    "High Risk detected: Professional clinical diagnosis is strongly recommended.",
    "Schedule an appointment with an endocrinologist for blood tests (Testosterone, LH/FSH) and a pelvic ultrasound.",
    "Medical intervention and lifestyle management under professional guidance are advised."
  ]
};

const PCOSPage = () => (
  <DisorderPage
    title="PCOS Detection"
    description="Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. Our ML model evaluates hormonal and metabolic markers to assess your risk."
    whyItMatters="Early detection can prevent infertility, diabetes, and cardiovascular complications"
    fields={fields}
    icon={<HeartPulse className="w-8 h-8" />}
    adviceMap={pcosAdvice}
  />
);

export default PCOSPage;
