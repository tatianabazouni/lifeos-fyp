import { Link } from "react-router-dom"; 
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Target, Clock, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: BookOpen,
    title: "Journal & Reflect",
    description: "Capture daily thoughts, tag moods, and discover patterns in your inner life.",
  },
  {
    icon: Target,
    title: "Goals & Vision",
    description: "Set meaningful goals, break them into steps, and track your progress visually.",
  },
  {
    icon: Clock,
    title: "Life Timeline",
    description: "Document life events in chapters—childhood, career, faith—and see your story unfold.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description: "Get AI-powered summaries, goal decomposition, and personalized motivational guidance.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">LifeOS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="Hero Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              Your Life Story, <span className="text-gradient">Beautifully Captured</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              LifeOS helps you journal, set goals, and document your journey—with AI-powered insights to guide your personal growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 py-6 gap-2">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/timeline">
                <Button variant="outline" size="lg" className="text-base px-8 py-6">
                  Explore Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">
            A thoughtful toolkit for intentional living and personal documentation.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-8 card-elevated border border-border"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-card rounded-2xl p-12 card-elevated border border-border">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Begin Your LifeOS Today
          </h2>
          <p className="text-muted-foreground mb-8">
            Your story matters. Start documenting it with intention.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="text-base px-8 py-6 gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-serif font-semibold text-foreground">LifeOS</span>
          </div>
          <p>© 2026 LifeOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;