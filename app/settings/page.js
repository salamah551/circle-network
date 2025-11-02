'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { 
  ArrowLeft, Save, Loader2, User, Briefcase, MapPin,
  Building2, Linkedin, Mail, Target, Lightbulb, FileText,
  Bell, Lock, CreditCard, LogOut, Check, X
} from 'lucide-react';

const EXPERTISE_OPTIONS = [
  'Fundraising', 'Sales', 'Marketing', 'Product', 'Engineering',
  'Operations', 'Finance', 'Legal', 'HR', 'Design', 'Strategy',
  'Business Development', 'Customer Success', 'Data Science',
  'Content', 'PR', 'Recruiting'
];

const NEEDS_OPTIONS = [
  'Fundraising', 'Hiring', 'Sales', 'Marketing', 'Product Strategy',
  'Technical Guidance', 'Legal Advice', 'Introductions', 'Mentorship',
  'Partnerships', 'Customer Acquisition', 'Scaling', 'Exit Strategy'
];

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [profile, setProfile] = useState({
    full_name: '',
    title: '',
    company: '',
    location: '',
    bio: '',
    linkedin_url: '',
    expertise: [],
    needs: [],
    challenges: ''
  });

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
      await loadProfile(session.user.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
  };

  const loadProfile = async (userId) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          title: data.title || '',
          company: data.company || '',
          location: data.location || '',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          expertise: data.expertise || [],
          needs: data.needs || [],
          challenges: data.challenges || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile.full_name || !profile.title || !profile.company || !profile.bio) {
      alert('Please fill in all required fields');
      return;
    }

    if (profile.expertise.length === 0 || profile.needs.length === 0) {
      alert('Please select at least one area of expertise and one need');
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          title: profile.title,
          company: profile.company,
          location: profile.location,
          bio: profile.bio,
          linkedin_url: profile.linkedin_url,
          expertise: profile.expertise,
          needs: profile.needs,
          challenges: profile.challenges,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleExpertise = (item) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.includes(item)
        ? prev.expertise.filter(e => e !== item)
        : [...prev.expertise, item]
    }));
  };

  const toggleNeed = (item) => {
    setProfile(prev => ({
      ...prev,
      needs: prev.needs.includes(item)
        ? prev.needs.filter(n => n !== item)
        : [...prev.needs, item]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 sticky top-24">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'account'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Lock className="w-5 h-5" />
                Account
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'billing'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Billing
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2">
                <Check className="w-5 h-5" />
                {successMessage}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="email"
                          value={currentUser?.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        Title *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                          placeholder="Co-Founder & CEO"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        Company *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                          placeholder="Your Company"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          placeholder="San Francisco, CA"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm">
                        LinkedIn URL
                      </label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="url"
                          value={profile.linkedin_url}
                          onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">
                      Bio *
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself, your background, and what you're working on..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[150px]"
                    />
                  </div>

                  {/* Expertise */}
                  <div>
                    <label className="block text-white/80 mb-3 text-sm flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Areas of Expertise *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXPERTISE_OPTIONS.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleExpertise(item)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            profile.expertise.includes(item)
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Needs */}
                  <div>
                    <label className="block text-white/80 mb-3 text-sm flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Looking For Help With *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NEEDS_OPTIONS.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleNeed(item)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            profile.needs.includes(item)
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <label className="block text-white/80 mb-2 text-sm">
                      Current Challenges (Optional)
                    </label>
                    <textarea
                      value={profile.challenges}
                      onChange={(e) => setProfile({ ...profile, challenges: e.target.value })}
                      placeholder="What are the biggest challenges you're facing right now?"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Email Address</h3>
                        <p className="text-white/60 text-sm">{currentUser?.email}</p>
                      </div>
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all text-sm">
                        Change Email
                      </button>
                    </div>
                    <p className="text-white/40 text-xs">
                      This is the email address associated with your account. Contact support to change it.
                    </p>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Member Status</h3>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-full">
                          <Check className="w-4 h-4" />
                          Founding Member
                        </span>
                      </div>
                    </div>
                    <p className="text-white/40 text-xs">
                      You're a founding member with lifetime pricing of $199/month.
                    </p>
                  </div>

                  <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-2">Danger Zone</h3>
                    <p className="text-white/60 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Billing & Subscription</h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Current Plan</h3>
                        <p className="text-2xl font-bold text-emerald-400">$199/month</p>
                        <p className="text-white/60 text-sm mt-1">Founding Member - Lifetime Rate</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-white/40 text-xs">
                      Your rate is locked in forever as a founding member. Regular pricing is $249/month.
                    </p>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-8 bg-white/10 border border-white/20 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <p className="text-white">•••• •••• •••• 4242</p>
                        <p className="text-white/60 text-sm">Expires 12/2025</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all text-sm">
                      Update Payment Method
                    </button>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Billing History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div>
                          <p className="text-white">Monthly Subscription</p>
                          <p className="text-white/60 text-sm">Dec 1, 2024</p>
                        </div>
                        <span className="text-white font-medium">$199.00</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div>
                          <p className="text-white">Monthly Subscription</p>
                          <p className="text-white/60 text-sm">Nov 1, 2024</p>
                        </div>
                        <span className="text-white font-medium">$199.00</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-white">Monthly Subscription</p>
                          <p className="text-white/60 text-sm">Oct 1, 2024</p>
                        </div>
                        <span className="text-white font-medium">$199.00</span>
                      </div>
                    </div>
                    <button className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm">
                      View All Invoices →
                    </button>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-2">Cancel Subscription</h3>
                    <p className="text-white/60 text-sm mb-4">
                      We'd hate to see you go! You'll lose access to all member benefits and your founding member rate.
                    </p>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-lg transition-all text-sm">
                      Cancel Membership
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Email Notifications</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start justify-between py-3 border-b border-white/10">
                        <div className="flex-1">
                          <p className="text-white font-medium">New Messages</p>
                          <p className="text-white/60 text-sm">Get notified when someone sends you a message</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between py-3 border-b border-white/10">
                        <div className="flex-1">
                          <p className="text-white font-medium">Introduction Requests</p>
                          <p className="text-white/60 text-sm">Get notified when someone requests an introduction</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between py-3 border-b border-white/10">
                        <div className="flex-1">
                          <p className="text-white font-medium">New Events</p>
                          <p className="text-white/60 text-sm">Get notified about upcoming member events</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between py-3 border-b border-white/10">
                        <div className="flex-1">
                          <p className="text-white font-medium">Request Replies</p>
                          <p className="text-white/60 text-sm">Get notified when someone replies to your request</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between py-3">
                        <div className="flex-1">
                          <p className="text-white font-medium">Weekly Digest</p>
                          <p className="text-white/60 text-sm">Get a weekly summary of network activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Marketing Emails</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start justify-between py-3">
                        <div className="flex-1">
                          <p className="text-white font-medium">Product Updates</p>
                          <p className="text-white/60 text-sm">Learn about new features and improvements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}