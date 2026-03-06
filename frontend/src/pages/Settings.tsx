import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { motion } from 'framer-motion';
import { User, Shield, LogOut, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, email });
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch {} finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {name[0] || 'U'}
              </div>
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="privacy">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 max-w-lg space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-muted-foreground">Allow others to find you</p>
              </div>
              <Switch checked={profilePublic} onCheckedChange={setProfilePublic} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Activity</p>
                <p className="text-sm text-muted-foreground">Display your activity to connections</p>
              </div>
              <Switch checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button variant="outline" onClick={logout} className="text-destructive border-destructive/20 hover:bg-destructive/5">
          <LogOut className="h-4 w-4 mr-2" />Sign Out
        </Button>
      </div>
    </div>
  );
}
