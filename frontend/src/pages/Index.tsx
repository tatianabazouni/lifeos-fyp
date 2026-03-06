import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Heart, Sparkles, Target } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';

const blocks = [
  { icon: Heart, title: 'Problem', body: 'Most apps track tasks. Few help you understand your inner life.' },
  { icon: Brain, title: 'Solution', body: 'LifeOS weaves reflection, memory, and growth into one cinematic experience.' },
  { icon: Target, title: 'How it works', body: 'Write, converse, track progress, and observe your life story in motion.' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#43001f,transparent_40%),#0b0608] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-6">
        <div className="flex items-center gap-2 font-serif text-xl"><Sparkles className="h-5 w-5 text-[#FFD150]" />LifeOS</div>
        <div className="flex gap-3"><Link to="/login"><SecondaryButton>Login</SecondaryButton></Link><Link to="/register"><PrimaryButton>Start free</PrimaryButton></Link></div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">Navigate your life story, not just your to-do list.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-white/70">An emotionally intelligent digital companion designed for reflection, direction, and personal evolution.</p>
          <div className="mt-8 flex justify-center gap-3"><Link to="/register"><PrimaryButton>Begin your chapter <ArrowRight className="ml-1 h-4 w-4" /></PrimaryButton></Link><Link to="/login"><SecondaryButton>View product</SecondaryButton></Link></div>
        </motion.section>

        <section className="grid gap-4 md:grid-cols-3">
          {blocks.map((block, index) => (
            <motion.article key={block.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <block.icon className="mb-4 h-5 w-5 text-[#FF9760]" />
              <h2 className="mb-2 font-serif text-2xl">{block.title}</h2>
              <p className="text-sm text-white/70">{block.body}</p>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  );
}
