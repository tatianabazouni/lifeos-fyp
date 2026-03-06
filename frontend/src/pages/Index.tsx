import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Heart, Sparkles, Target, Workflow } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';

const sectionAnimation = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.25 }, transition: { duration: 0.6 } };

const features = [
  { icon: Brain, title: 'AI Reflection', body: 'Emotionally intelligent prompts and insights based on your own writing.' },
  { icon: Target, title: 'Meaningful Goals', body: 'Track growth with milestones, progress visuals, and evolving priorities.' },
  { icon: Heart, title: 'Memory Archive', body: 'Capture moments as a timeline so your life feels coherent over time.' },
  { icon: Workflow, title: 'Life Narrative', body: 'From onboarding to dashboard, every flow reinforces your personal story.' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#43001f,transparent_40%),#0b0608] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-6">
        <div className="flex items-center gap-2 font-serif text-xl"><Sparkles className="h-5 w-5 text-[#FFD150]" />LifeOS</div>
        <div className="flex gap-3"><Link to="/login"><SecondaryButton>Login</SecondaryButton></Link><Link to="/register"><PrimaryButton>Start free</PrimaryButton></Link></div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 pb-24 pt-12">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-tight md:text-7xl">Navigate your life story, not just your to-do list.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-white/70">LifeOS is an AI-assisted digital companion for reflection, memory, and intentional personal growth.</p>
          <div className="mt-8 flex justify-center gap-3"><Link to="/register"><PrimaryButton>Begin your chapter <ArrowRight className="ml-1 h-4 w-4" /></PrimaryButton></Link><Link to="/login"><SecondaryButton>Explore product</SecondaryButton></Link></div>
        </motion.section>

        <motion.section {...sectionAnimation}>
          <h2 className="mb-2 text-3xl font-semibold">Problem</h2>
          <p className="max-w-3xl text-white/70">Most tools optimize output. Very few help humans process emotion, preserve meaning, and make thoughtful decisions from self-awareness.</p>
        </motion.section>

        <motion.section {...sectionAnimation}>
          <h2 className="mb-2 text-3xl font-semibold">Solution</h2>
          <p className="max-w-3xl text-white/70">LifeOS combines journaling, goals, AI coaching, and memory timelines into one calm immersive product where your growth is visible and emotionally coherent.</p>
        </motion.section>

        <motion.section {...sectionAnimation}>
          <h2 className="mb-6 text-3xl font-semibold">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <motion.article key={feature.title} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <feature.icon className="mb-4 h-5 w-5 text-[#FF9760]" />
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.body}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionAnimation}>
          <h2 className="mb-6 text-3xl font-semibold">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {['Sign up and onboard your current season', 'Reflect daily with journal + AI prompts', 'Track growth across goals, memories, and analytics'].map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-2 text-xs text-[#FFD150]">STEP {index + 1}</p>
                <p className="text-sm text-white/80">{step}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...sectionAnimation} className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <h2 className="text-3xl font-semibold">Start your next chapter with clarity</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">From signup to dashboard, LifeOS helps you feel the continuity of your own story.</p>
          <Link to="/register"><PrimaryButton className="mt-6">Create your account</PrimaryButton></Link>
        </motion.section>
      </main>
    </div>
  );
}
