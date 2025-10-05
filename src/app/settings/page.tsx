"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarLayout } from "@/components/navigation/sidebar";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access your settings.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Address</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="outline">Change Email</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-muted-foreground">Last updated recently</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Match Alerts</h3>
                    <p className="text-sm text-muted-foreground">Get notified when new matches are found</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Profile Visibility</h3>
                    <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Data Export</h3>
                    <p className="text-sm text-muted-foreground">Download your data</p>
                  </div>
                  <Button variant="outline">Export Data</Button>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Account Deletion</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}