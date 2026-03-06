import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { EmotionTag } from '@/components/InteractiveComponents';
import { useState } from 'react';

const intents = ['Clarity', 'Healing', 'Purpose', 'Discipline', 'Presence'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (intent: string) => {
    setSelected((prev) => (prev.includes(intent) ? prev.filter((x) => x !== intent) : [...prev, intent]));
  };

  return (
    <div className="mx-auto max-w-3xl py-12">
      <PageHeader title="Welcome to LifeOS" subtitle="Before we begin, what kind of season are you entering?" />
      <SectionContainer>
        <div className="flex flex-wrap gap-2">
          {intents.map((intent) => (
            <EmotionTag key={intent} label={intent} active={selected.includes(intent)} onClick={() => toggle(intent)} />
          ))}
        </div>
        <PrimaryButton className="mt-8" onClick={() => navigate('/dashboard')}>Enter your dashboard</PrimaryButton>
      </SectionContainer>
    </div>
  );
}
