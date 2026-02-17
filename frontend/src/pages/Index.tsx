import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse, Brain, Droplets, Bone, Activity, Ribbon,
  ArrowRight, ClipboardList, Cpu, BarChart3, Shield, Users, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-medical.jpg";

const disorders = [
  { title: "PCOS Detection", desc: "Polycystic Ovary Syndrome screening using hormonal and metabolic indicators.", icon: <HeartPulse className="w-6 h-6" />, path: "/pcos", color: "from-primary to-primary/70" },
  { title: "Anemia Detection", desc: "Iron-deficiency and anemia risk assessment through hematological parameters.", icon: <Droplets className="w-6 h-6" />, path: "/anemia", color: "from-destructive to-destructive/70" },
  { title: "Thyroid Disorder", desc: "Hypo/Hyperthyroidism prediction using thyroid function markers.", icon: <Brain className="w-6 h-6" />, path: "/thyroid", color: "from-warning to-warning/70" },
  { title: "Osteoporosis Risk", desc: "Bone density risk evaluation using demographic and clinical factors.", icon: <Bone className="w-6 h-6" />, path: "/osteoporosis", color: "from-success to-success/70" },
  { title: "Breast Cancer Risk", desc: "Early breast cancer risk screening based on clinical features.", icon: <Ribbon className="w-6 h-6" />, path: "/breast-cancer", color: "from-secondary-foreground to-primary" },
];

const steps = [
  { icon: <ClipboardList className="w-7 h-7" />, title: "Enter Clinical Data", desc: "Input relevant health parameters and medical history into our secure screening form." },
  { icon: <Cpu className="w-7 h-7" />, title: "AI Model Analysis", desc: "Our trained ML models analyze your data using validated clinical algorithms." },
  { icon: <BarChart3 className="w-7 h-7" />, title: "Risk Prediction Result", desc: "Receive an instant risk assessment with confidence scores and recommendations." },
];

const stats = [
  { value: "5+", label: "Disorders Covered" },
  { value: "95%", label: "Model Accuracy" },
  { value: "10K+", label: "Screenings Done" },
  { value: "24/7", label: "Available Access" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const } }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-hero-subtle opacity-60" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/30 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-xs font-semibold text-accent-foreground mb-6">
                <Activity className="w-3.5 h-3.5" />
                ML-Powered Health Screening
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                AI-Powered Early Detection for{" "}
                <span className="text-gradient">Women's Health</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Advanced Machine Learning models for smarter risk assessment. Screen for PCOS, Anemia, Thyroid disorders, Osteoporosis, and Breast Cancer risk.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-hero-gradient text-primary-foreground shadow-hero hover:opacity-90 transition-opacity px-8">
                  <Link to="/pcos">Start Screening <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border text-foreground hover:bg-accent">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-hero-gradient rounded-3xl opacity-10 blur-2xl" />
                <img
                  src={heroImage}
                  alt="Medical AI health analytics visualization with DNA helix and health data"
                  className="relative rounded-2xl shadow-hero w-full object-cover"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center">
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              About <span className="text-gradient">SheHealth</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-8">
              SheHealth is an AI-powered clinical decision-support system designed to predict the risk of common female health disorders using trained machine learning models. Our platform leverages predictive analytics, validated clinical datasets, and advanced algorithms to provide early risk assessments — empowering women and healthcare providers with actionable insights.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: <Cpu className="w-5 h-5" />, label: "AI & ML Powered" },
                { icon: <Shield className="w-5 h-5" />, label: "Privacy-First Design" },
                { icon: <Users className="w-5 h-5" />, label: "Research-Backed" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-accent-foreground text-sm font-medium">
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disorders */}
      <section id="disorders-section" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Disorders We Screen
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform covers five critical female health conditions, each powered by individually trained ML models.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {disorders.map((d, i) => (
              <motion.div key={d.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={d.path} className="group flex flex-col h-full bg-background rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform`}>
                    {d.icon}
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">{d.desc}</p>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                    Screen Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to get your AI-powered risk assessment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5 text-primary">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2">Step {i + 1}</div>
                <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="bg-accent/50 rounded-2xl border border-border p-8">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-3">Important Disclaimer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This tool is for educational and early screening purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. The predictions generated are based on machine learning models and should be validated by clinical professionals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
