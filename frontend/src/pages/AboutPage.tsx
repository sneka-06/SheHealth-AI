import { motion } from "framer-motion";
import { HeartPulse, Shield, Users, Brain, Target, BookOpen } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const AboutPage = () => (
  <div className="min-h-screen bg-background pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-4xl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          About <span className="text-gradient">SheHealth</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          SheHealth is a Machine Learning Based Prediction System for Female Disorders — an AI-powered clinical decision-support platform designed for early risk assessment of common women's health conditions.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 mb-14">
        {[
          { icon: <Brain className="w-6 h-6" />, title: "AI-Powered Analysis", desc: "Leveraging trained ML models for accurate risk prediction across multiple disorders." },
          { icon: <Target className="w-6 h-6" />, title: "Early Detection", desc: "Enabling timely identification of health risks before they become critical." },
          { icon: <Shield className="w-6 h-6" />, title: "Privacy First", desc: "No sensitive patient data is stored. Your privacy and security are paramount." },
          { icon: <BookOpen className="w-6 h-6" />, title: "Research-Backed", desc: "Models trained on validated clinical datasets with peer-reviewed methodologies." },
          { icon: <Users className="w-6 h-6" />, title: "Accessible Design", desc: "Intuitive interface designed for both healthcare providers and individuals." },
          { icon: <HeartPulse className="w-6 h-6" />, title: "Women's Health Focus", desc: "Dedicated to addressing gender-specific health conditions often under-diagnosed." },
        ].map((item, i) => (
          <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">{item.icon}</div>
            <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-accent/50 rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Academic Project:</strong> SheHealth was developed as a final-year academic research project demonstrating the application of machine learning in healthcare. It is intended for educational and early screening purposes only and is not a certified medical diagnostic tool.
        </p>
      </div>
    </div>
  </div>
);

export default AboutPage;
