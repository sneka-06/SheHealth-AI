import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import splashImage from "@/assets/splash-welcome.png";

const SplashPage = () => {
    return (
        <div className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
            {/* Background Layer - Universal Animation */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <motion.svg
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="absolute bottom-0 w-[200%] h-full text-primary/20"
                    animate={{
                        x: ["-50%", "0%"],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <path
                        fill="currentColor"
                        d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </motion.svg>
                <motion.svg
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    className="absolute bottom-10 w-[200%] h-full text-secondary/30"
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <path
                        fill="currentColor"
                        d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,139,864,149.3C960,160,1056,160,1152,144C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </motion.svg>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
                {/* Left Pane - Content */}
                <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left max-w-md"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            Empowering Women with AI
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                            Welcome to <span className="text-gradient">SheHealth-AI</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                            Dedicated health screening powered by advanced AI. We provide soft,
                            supportive, and professional risk assessments tailored for your health journey.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="bg-hero-gradient text-primary-foreground shadow-hero hover:opacity-90 transition-opacity px-10 h-14 rounded-2xl text-lg font-semibold"
                        >
                            <Link to="/home">
                                Get Started <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Right Pane - Illustration (Transparent) */}
                <div className="w-full md:w-1/2 h-full relative flex items-center justify-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative w-full h-full p-8 md:p-12 lg:p-20"
                    >
                        <img
                            src={splashImage}
                            alt="SheHealth-AI Welcome Visualization"
                            className="relative w-full h-full object-contain drop-shadow-2xl"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SplashPage;
