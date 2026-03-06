import { useEffect, useState } from 'react';
import api from '@/services/api';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/StateHelpers';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Connection {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: 'friend' | 'couple' | 'family';
  status: 'accepted' | 'pending_sent' | 'pending_received';
}

interface UserResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const typeIcons: Record<string, string> = { friend: '👫', couple: '❤️', family: '👪' };

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const fetch_ = () => {
    setLoading(true);
    api.get<Connection[]>('/connections')
      .then((res) => setConnections(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch_(); }, []);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<UserResult[]>(`/connections/users/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch {} finally { setSearching(false); }
  };

  const sendRequest = async (userId: string) => {
    await api.post('/connections/request', { userId });
    fetch_();
  };

  const acceptRequest = async (connectionId: string) => {
    await api.put('/connections/accept', { connectionId });
    fetch_();
  };

  const declineRequest = async (connectionId: string) => {
    await api.put('/connections/decline', { connectionId });
    fetch_();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetch_} />;

  const myCircle = connections.filter((c) => c.status === 'accepted');
  const pendingReceived = connections.filter((c) => c.status === 'pending_received');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Connections</h1>
        <p className="page-subtitle">Build meaningful relationships</p>
      </div>

      <Tabs defaultValue="circle">
        <TabsList className="mb-4">
          <TabsTrigger value="circle">My Circle</TabsTrigger>
          <TabsTrigger value="find">Find People</TabsTrigger>
          <TabsTrigger value="shared">Shared Boards</TabsTrigger>
        </TabsList>

        <TabsContent value="circle">
          {pendingReceived.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Pending Requests</h3>
              <div className="space-y-2">
                {pendingReceived.map((c) => (
                  <div key={c.id} className="glass-card p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {c.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <Button size="sm" onClick={() => acceptRequest(c.id)}><Check className="h-3 w-3 mr-1" />Accept</Button>
                    <Button size="sm" variant="ghost" onClick={() => declineRequest(c.id)}><X className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myCircle.length === 0 ? (
            <EmptyState icon={<Users className="h-8 w-8 text-muted-foreground" />} title="Your circle is empty" description="Find people to connect with" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {myCircle.map((c) => (
                <div key={c.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-lg font-bold text-primary-foreground">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{typeIcons[c.type]} {c.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="find">
          <div className="flex gap-2 mb-4">
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers()} placeholder="Search by name or email" className="flex-1" />
            <Button onClick={searchUsers} disabled={searching}><Search className="h-4 w-4" /></Button>
          </div>

          {searchResults.length === 0 ? (
            <EmptyState icon={<Search className="h-8 w-8 text-muted-foreground" />} title="Search for people" description="Find friends, family, and partners to connect with" />
          ) : (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="glass-card p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">{u.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => sendRequest(u.id)}><UserPlus className="h-3 w-3 mr-1" />Connect</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared">
          <EmptyState icon={<Eye className="h-8 w-8 text-muted-foreground" />} title="No shared boards" description="When connections share their vision boards, they'll appear here" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
