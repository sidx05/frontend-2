'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  Database,
  Cookie,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface PrivacySettingsProps {
  className?: string;
}

export default function PrivacySettings({ className }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    analytics: true,
    marketing: false,
    personalization: true,
    dataRetention: '12',
    cookieConsent: 'accepted',
    profileVisibility: 'limited',
    dataSharing: false
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to backend
    localStorage.setItem(`privacy-setting-${key}`, String(value));
  };

  const handleExportData = async () => {
    try {
      // Mock data export - in a real app, this would fetch actual user data
      const userData = {
        profile: {
          name: 'John Doe',
          email: 'user@example.com',
          preferences: settings
        },
        activity: {
          lastLogin: new Date().toISOString(),
          articlesRead: 45,
          comments: 12,
          bookmarks: 8
        },
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `newshub-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real app, this would:
      // 1. Send request to backend to delete user data
      // 2. Clear local storage
      // 3. Log out user
      // 4. Redirect to confirmation page
      
      localStorage.clear();
      alert('Account deletion request submitted. You will receive a confirmation email.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  useEffect(() => {
    // Load saved settings
    const savedSettings = {};
    Object.keys(settings).forEach(key => {
      const saved = localStorage.getItem(`privacy-setting-${key}`);
      if (saved) {
        savedSettings[key] = saved === 'true' ? true : saved === 'false' ? false : saved;
      }
    });
    
    if (Object.keys(savedSettings).length > 0) {
      setSettings(prev => ({ ...prev, ...savedSettings }));
    }
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Data Controls</span>
          </CardTitle>
          <CardDescription>
            Manage your privacy settings and control how your data is used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Collection Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Collection</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Analytics & Performance</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Help us improve NewsHub by collecting anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => handleSettingChange('analytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Personalization</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get personalized content recommendations based on your interests
                  </p>
                </div>
                <Switch
                  checked={settings.personalization}
                  onCheckedChange={(checked) => handleSettingChange('personalization', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Cookie className="w-4 h-4" />
                    <span>Marketing Communications</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and promotional content
                  </p>
                </div>
                <Switch
                  checked={settings.marketing}
                  onCheckedChange={(checked) => handleSettingChange('marketing', checked)}
                />
              </div>
            </div>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Retention</h3>
            
            <div className="space-y-2">
              <Label>How long should we keep your activity data?</Label>
              <Select value={settings.dataRetention} onValueChange={(value) => handleSettingChange('dataRetention', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">1 year (Recommended)</SelectItem>
                  <SelectItem value="24">2 years</SelectItem>
                  <SelectItem value="0">Don't retain (Delete immediately)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                After this period, your activity data will be automatically deleted
              </p>
            </div>
          </div>

          {/* Profile Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Visibility</h3>
            
            <div className="space-y-2">
              <Label>Who can see your profile and activity?</Label>
              <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="w-4 h-4" />
                      <span>Private - Only you</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="limited">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Limited - Registered users only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>Public - Everyone</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Sharing</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Share anonymized data with research partners</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve journalism and media research by sharing anonymized data
                </p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Exercise your rights to access and control your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 h-auto p-4"
            >
              <div className="flex flex-col items-center space-y-2">
                <Download className="w-6 h-6" />
                <span className="text-sm">Export My Data</span>
                <span className="text-xs text-muted-foreground">
                  Download all your personal information
                </span>
              </div>
            </Button>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 h-auto p-4"
            >
              <div className="flex flex-col items-center space-y-2">
                <Trash2 className="w-6 h-6" />
                <span className="text-sm">Delete Account</span>
                <span className="text-xs text-muted-foreground">
                  Permanently remove your account and data
                </span>
              </div>
            </Button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>
              These actions are irreversible. Please consider carefully before proceeding.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Analytics</Label>
              <Badge variant={settings.analytics ? "default" : "secondary"}>
                {settings.analytics ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Personalization</Label>
              <Badge variant={settings.personalization ? "default" : "secondary"}>
                {settings.personalization ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Marketing</Label>
              <Badge variant={settings.marketing ? "default" : "secondary"}>
                {settings.marketing ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data Retention</Label>
              <Badge variant="outline">
                {settings.dataRetention === '0' ? 'None' : `${settings.dataRetention} months`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}