"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosInstances from '@/utils/axiosInstance';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Clock, Upload, Bell, Shield, Key, Laptop, Mail, Smartphone, Globe, AlertCircle, CheckCircle2, XCircle, ChromeIcon as Browser } from 'lucide-react';
import { StatusDialog } from '@/components/StatusDialog';
import { cn } from "@/lib/utils";
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { useUser } from '@/components/context/UserContext';
import { debounce } from 'lodash';
export default function SettingsPage() {

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { userData, updateUserProfile, fetchUserData, isLoading } = useUser();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [bio, setBio] = useState(userData.preferences.description || '');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Add this function to handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match"
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long"
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await axiosInstances.UserService.put(
        `/users/update-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }
      );

      // Clear password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Success",
        description: "Password updated successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update password"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Debounced function to update bio
  const debouncedUpdateBio = useCallback(
    debounce(async (newBio: string) => {
      try {
        await axiosInstances.UserService.put(
          `/users/profile`,
          {
            name: userData.user.name,
            description: newBio,
            localTime: userData.preferences.localTime
          }
        );

        // Update userData in context after profile update
        await updateUserProfile({
          user: userData.user,
          preferences: { ...userData.preferences, description: newBio }
        });
      } catch (error) {
        // Silently handle error
        console.error('Failed to update bio:', error);
      }
    }, 5000),
    [userData.user.name, userData.preferences.localTime, updateUserProfile]
  );

  // Handle bio change
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    setBio(newBio);
    debouncedUpdateBio(newBio);
  };

  useEffect(() => {
    // Set bio when user data changes
    if (userData.preferences.description !== bio) {
      setBio(userData.preferences.description);
    }
  }, [userData]);



  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('ct_token');
      const response = await axiosInstances.UserService.put(
        `/users/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user context with new avatar URL
      await updateUserProfile({
        user: {
          ...userData.user,
          avatar: response.data.avatarUrl
        },
        preferences: userData.preferences
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    } catch (error) {
      console.log("Err:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    if (!status) return 'Set a status';
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container w-full py-8 px-4 mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set email preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 gap-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background">
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-6 relative">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage
                      src={userData.user.avatar || "https://via.placeholder.com/96"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {userData.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {userData.preferences.status === 'active' && (
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                  )}
                  <Label
                    htmlFor="avatar-upload"
                    className={cn(
                      "absolute bottom-0 right-0 p-2",
                      "bg-primary text-primary-foreground",
                      "rounded-full shadow-lg cursor-pointer",
                      "transition-all duration-300",
                      "opacity-0 group-hover:opacity-100",
                      "transform translate-y-2 group-hover:translate-y-0",
                      uploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    className="hidden"
                    id="avatar-upload"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{userData.user.name}</h2>
                  <p className="text-muted-foreground">{userData.user.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    {userData.preferences.localTime}
                  </div>
                </div>
                <EditProfileDialog />
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStatusDialogOpen(true)}
                      className={cn(
                        "flex justify-start gap-2 text-left h-auto py-3",
                        "transition-all duration-200",
                        "hover:bg-muted/50"
                      )}
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{getStatusDisplay(userData.preferences.status)}</span>
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Write a short bio about yourself..."
                      value={bio}
                      onChange={handleBioChange}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  {/* <Button
              type="submit"
              className="w-fit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button> */}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Manage your email preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly project updates
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about security events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Laptop className="w-5 h-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  Manage your active sessions and devices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Browser className="w-5 h-5 text-green-500 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Chrome - macOS</p>
                      <p className="text-xs text-muted-foreground">Current session</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-start gap-4">
                    <Smartphone className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Mobile App - iPhone</p>
                      <p className="text-xs text-muted-foreground">Last active: 2 hours ago</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-destructive">
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your devices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show desktop notifications
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Password
              </CardTitle>
              <CardDescription>
                Change your password and manage 2FA settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-fit"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Two-factor authentication not enabled</h4>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with two-factor authentication
                  </p>
                </div>
                <Button>Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={userData.preferences.status}
        onStatusChange={fetchUserData}
      />
    </div>
  );
}
