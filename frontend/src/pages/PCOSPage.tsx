import DisorderPage, { FormField } from "@/components/DisorderPage";
import { HeartPulse } from "lucide-react";

const fields: FormField[] = [
  { name: "age", label: "Age", type: "number", placeholder: "e.g. 28", unit: "years", min: 10, max: 60 },
  { name: "bmi", label: "BMI", type: "number", placeholder: "e.g. 24.5", unit: "kg/m²", min: 10, max: 60 },
  { name: "menstrual_irregularity", label: "Menstrual Irregularity", type: "select", options: [{ label: "Yes", value: "1" }, { label: "No", value: "0" }] },
  { name: "testosterone_level", label: "Testosterone Level", type: "number", placeholder: "e.g. 45", unit: "ng/dL", min: 0, max: 200 },
  { name: "antral_follicle_count", label: "Antral Follicle Count", type: "number", placeholder: "e.g. 12", min: 0, max: 40 },
];

const PCOSPage = () => (
  <DisorderPage
    title="PCOS Detection"
    description="Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. Our ML model evaluates hormonal and metabolic markers to assess your risk."
    whyItMatters="Early detection can prevent infertility, diabetes, and cardiovascular complications"
    fields={fields}
    icon={<HeartPulse className="w-8 h-8" />}
  />
);

export default PCOSPage;
