import { useRef, useState } from 'react';
import { LogOut, Moon, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { PrimaryButton } from '@/components/AppButtons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [themeDark, setThemeDark] = useState(false);
  const [push, setPush] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [profilePublic, setProfilePublic] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage profile, account preferences, notifications, privacy, and security." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="preferences"><Moon className="mr-2 h-4 w-4" />Preferences</TabsTrigger>
          <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <SectionContainer title="Profile editing" description="Update personal identity details and avatar.">
            <div className="mb-4 flex items-center gap-4">
              <img src={avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=C5005E&color=fff`} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
              <PrimaryButton variant="secondary" onClick={() => fileRef.current?.click()}>Upload avatar</PrimaryButton>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={(event) => handleAvatar(event.target.files?.[0])} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label>Name</Label><Input value={name} onChange={(event) => setName(event.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            </div>
          </SectionContainer>
          <SectionContainer title="Password change" description="Rotate credentials regularly for account safety.">
            <div className="grid gap-3 md:grid-cols-3">
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm password" />
            </div>
            <PrimaryButton className="mt-4">Update password</PrimaryButton>
          </SectionContainer>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <SectionContainer title="Theme settings">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-medium">Dark mode</p><p className="text-xs text-muted-foreground">Use a calm, low-luminance experience.</p></div>
              <Switch checked={themeDark} onCheckedChange={setThemeDark} />
            </div>
          </SectionContainer>
          <SectionContainer title="Notification settings">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3"><p className="text-sm">Push reminders</p><Switch checked={push} onCheckedChange={setPush} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><p className="text-sm">Weekly reflection digest</p><Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} /></div>
            </div>
          </SectionContainer>
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <SectionContainer title="Privacy settings">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3"><p className="text-sm">Public profile</p><Switch checked={profilePublic} onCheckedChange={setProfilePublic} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><p className="text-sm">Share activity with connections</p><Switch checked={showActivity} onCheckedChange={setShowActivity} /></div>
            </div>
          </SectionContainer>
        </TabsContent>
      </Tabs>

      <PrimaryButton variant="outline" onClick={logout} className="border-destructive/30 text-destructive hover:bg-destructive/10"><LogOut className="mr-2 h-4 w-4" />Sign out</PrimaryButton>
    </div>
  );
}
