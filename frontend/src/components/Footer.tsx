import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-gradient">
                SheHealth
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered clinical decision-support system for early risk assessment of common female health disorders.
            </p>

          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Screenings</h4>
            <ul className="space-y-2.5">
              {[
                { label: "PCOS Detection", path: "/pcos" },
                { label: "Anemia Detection", path: "/anemia" },
                { label: "Thyroid Disorder", path: "/thyroid" },
                { label: "Osteoporosis Risk", path: "/osteoporosis" },
                { label: "Breast Cancer Risk", path: "/breast-cancer" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4 text-sm">Disclaimer</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              SheHealth is an AI-based screening tool for educational and early detection purposes only. It does not provide medical diagnoses. Always consult a qualified healthcare professional for clinical decisions.
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SheHealth. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Machine Learning Based Prediction System for Female Disorders
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
