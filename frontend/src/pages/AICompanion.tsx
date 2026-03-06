import { useMemo, useState } from 'react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { AIInsightCard } from '@/components/ContentCards';
import { Input } from '@/components/ui/input';
import { PrimaryButton } from '@/components/AppButtons';

interface ChatMessage { role: 'user' | 'ai'; content: string }

const suggestions = [
  'Help me process today without overthinking.',
  'Give me one reflective question based on my goals.',
  'What pattern do you see in my recent moods?',
];

export default function AICompanion() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'ai', content: 'I am here with you. What feels most present today?' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const history = useMemo(() => messages.slice(-6), [messages]);

  const send = (prompt?: string) => {
    const value = prompt ?? input;
    if (!value) return;
    setMessages((prev) => [...prev, { role: 'user', content: value }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', content: `I hear you: "${value}". Consider naming the emotion, the need underneath it, and one small action before sleep.` }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Companion" subtitle="A calm conversational layer for reflection, insight, and memory recall." />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Conversation" description="Private, contextual, and emotionally aware.">
          <div className="mb-3 max-h-96 space-y-2 overflow-auto pr-1">
            {history.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-white' : 'max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm'}>{message.content}</div>
            ))}
            {typing && <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3 text-sm">Typing…</div>}
          </div>
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Talk to your companion" />
            <PrimaryButton onClick={() => send()}>Send</PrimaryButton>
          </div>
        </SectionContainer>
        <SectionContainer title="Suggestions">
          <div className="space-y-2">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)} className="w-full rounded-lg border p-3 text-left text-sm hover:bg-muted">{suggestion}</button>)}</div>
        </SectionContainer>
        <SectionContainer title="AI insights">
          <div className="space-y-3">
            <AIInsightCard title="Pattern" content="Your strongest entries are written between 10pm and midnight, often after social interactions." />
            <AIInsightCard title="Memory reference" content="Three times this month you connected calmness with morning walks. Want to turn this into a ritual?" />
          </div>
        </SectionContainer>
      </div>
    </div>
  );
}
