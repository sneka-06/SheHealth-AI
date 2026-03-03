import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative w-10 h-10 rounded-lg transition-colors hover:bg-accent"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Moon className="h-5 w-5 text-primary" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sun className="h-5 w-5 text-primary" />
                    </motion.div>
                )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
