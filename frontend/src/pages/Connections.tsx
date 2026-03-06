import { useMemo, useState } from 'react';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { ConnectionCard, MemoryCard } from '@/components/ContentCards';
import { EmotionTag } from '@/components/InteractiveComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';

interface Person {
  id: string;
  name: string;
  type: string;
  note: string;
  interactions: { date: string; note: string }[];
  sharedMemories: { title: string; date: string; description: string }[];
}

const relationshipTypes = ['Friend', 'Partner', 'Family', 'Mentor', 'Teammate'];

export default function Connections() {
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Amir', type: 'Friend', note: 'Keeps me grounded when stress spikes.', interactions: [{ date: '2026-03-01', note: 'Talked about burnout and boundaries.' }], sharedMemories: [{ title: 'Midnight walk after demo', date: '2026-02-25', description: 'We reframed failure as signal, not identity.' }] },
  ]);
  const [name, setName] = useState('');
  const [type, setType] = useState('Friend');
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState('1');

  const selectedPerson = useMemo(() => people.find((person) => person.id === selectedId), [people, selectedId]);

  const addPerson = () => {
    if (!name.trim()) return;
    const person: Person = { id: crypto.randomUUID(), name, type, note, interactions: [], sharedMemories: [] };
    setPeople((prev) => [...prev, person]);
    setSelectedId(person.id);
    setName('');
    setNote('');
  };

  const addInteraction = () => {
    if (!selectedPerson) return;
    const text = prompt('Log a meaningful interaction');
    if (!text) return;
    setPeople((prev) => prev.map((person) => person.id === selectedPerson.id ? { ...person, interactions: [{ date: new Date().toISOString().slice(0, 10), note: text }, ...person.interactions] } : person));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Connections" subtitle="Track your relationships as living stories: people, interactions, and shared memories." />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionContainer title="Add person" description="Start with one relationship that matters.">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="mb-3" />
          <div className="mb-3 flex flex-wrap gap-2">{relationshipTypes.map((item) => <EmotionTag key={item} label={item} active={type === item} onClick={() => setType(item)} />)}</div>
          <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Relationship note" className="mb-3" />
          <PrimaryButton onClick={addPerson}>Add connection</PrimaryButton>
        </SectionContainer>

        <SectionContainer title="People">
          <div className="space-y-3">
            {people.map((person) => (
              <button key={person.id} onClick={() => setSelectedId(person.id)} className="w-full text-left">
                <ConnectionCard name={person.name} type={person.type} note={person.note} />
              </button>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title="Interaction timeline" description="Log moments that shape trust and closeness.">
          <PrimaryButton onClick={addInteraction} className="mb-3">Add interaction</PrimaryButton>
          <ol className="space-y-3 border-l pl-4">
            {selectedPerson?.interactions.map((interaction) => (
              <li key={`${interaction.date}-${interaction.note}`}>
                <p className="text-xs text-primary">{interaction.date}</p>
                <p className="text-sm">{interaction.note}</p>
              </li>
            ))}
          </ol>
        </SectionContainer>
      </div>

      <SectionContainer title="Shared memories">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {selectedPerson?.sharedMemories.map((memory) => <MemoryCard key={memory.title} {...memory} />)}
        </div>
      </SectionContainer>
    </div>
  );
}
