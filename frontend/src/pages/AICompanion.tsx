import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Sparkles } from 'lucide-react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { AIInsightCard } from '@/components/ContentCards';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/AppButtons';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const suggestionCards = [
  'Help me process today without overthinking.',
  'Give me one reflective question based on my goals.',
  'What pattern do you see in my recent moods?',
];

export default function AICompanion() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', content: 'I am here with you. What feels most present today?', timestamp: 'Now' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const history = useMemo(() => messages.slice(-8), [messages]);

  const send = (preset?: string) => {
    const value = (preset ?? input).trim();
    if (!value) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: value, timestamp: now }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = `I hear you: "${value}". Name the emotion, identify the unmet need beneath it, then choose one tiny action before sleep.`;
      setMessages((prev) => [...prev, { role: 'ai', content: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Companion" subtitle="A calm life-coach interface with chat, memory references, and reflection prompts." />

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Conversation interface" description="Contextual, private, and emotionally intelligent.">
          <div className="mb-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {history.map((message, index) => (
              <motion.div key={`${message.timestamp}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={message.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-white' : 'max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm'}>
                <p>{message.content}</p>
                <p className="mt-1 text-[10px] opacity-70">{message.timestamp}</p>
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }} className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm">
                Typing...
              </motion.div>
            )}
          </div>

          <div className="flex gap-2">
            <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Share what feels heavy right now" />
            <PrimaryButton onClick={() => send()}>Send</PrimaryButton>
          </div>
        </SectionContainer>

        <SectionContainer title="AI suggestion cards" description="Tap to continue a guided reflection.">
          <div className="space-y-2">
            {suggestionCards.map((card) => (
              <button key={card} onClick={() => send(card)} className="w-full rounded-lg border p-3 text-left text-sm transition hover:bg-muted">{card}</button>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title="Insights + memory referencing">
          <div className="space-y-3">
            <AIInsightCard title="Journal-based insight" content="You sound most regulated on days you walk early and reduce social comparison exposure." />
            <AIInsightCard title="Memory reference" content="In February, after your first prototype demo, you wrote that courage increases when you share process, not perfection." />
            <div className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
              <p className="mb-1 flex items-center gap-2 font-medium text-foreground"><Clock3 className="h-4 w-4" />Conversation history</p>
              <p>Last 8 messages retained in this session to preserve narrative context.</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm"><p className="flex items-center gap-2 font-medium text-primary"><Sparkles className="h-4 w-4" />Reflection prompt</p><p className="mt-1">What part of you needs compassion before strategy tonight?</p></div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
