'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/(main)/auth-provider';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { logout, userEmail } = useAuth();
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [savedLinkedin, setSavedLinkedin] = useState('');
  const [savedGithub, setSavedGithub] = useState('');

  useEffect(() => {
    if (userEmail) {
      const storedLinkedin = localStorage.getItem(`${userEmail}-linkedin`) || '';
      const storedGithub = localStorage.getItem(`${userEmail}-github`) || '';
      setLinkedin(storedLinkedin);
      setGithub(storedGithub);
      setSavedLinkedin(storedLinkedin);
      setSavedGithub(storedGithub);
    }
  }, [userEmail]);


  const saveLinkedin = () => {
    if (!linkedin || !userEmail) return;
    localStorage.setItem(`${userEmail}-linkedin`, linkedin);
    setSavedLinkedin(linkedin);
  };

  const saveGithub = () => {
    if (!github || !userEmail) return;
    localStorage.setItem(`${userEmail}-github`, github);
    setSavedGithub(github);
  };

  const deleteLinkedin = () => {
    if (!userEmail) return;
    localStorage.removeItem(`${userEmail}-linkedin`);
    setLinkedin('');
    setSavedLinkedin('');
  };

  const deleteGithub = () => {
    if (!userEmail) return;
    localStorage.removeItem(`${userEmail}-github`);
    setGithub('');
    setSavedGithub('');
  };


  const handleDeleteAccount = async () => {
    // This is a placeholder for a real delete account flow.
    // In a real app, this would make a request to a backend to delete the user.
    console.log("Deleting account for", userEmail);
    logout();
  };

  return (
     <div className="space-y-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail || ''} readOnly disabled />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label>LinkedIn Profile</Label>
            {savedLinkedin ? (
              <div className="flex items-center gap-2">
                <a
                  href={savedLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline truncate"
                >
                  {savedLinkedin}
                </a>
                <Button size="sm" variant="outline" onClick={deleteLinkedin}>
                  Delete
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
                <Button size="sm" onClick={saveLinkedin}>
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label>GitHub Profile</Label>
            {savedGithub ? (
              <div className="flex items-center gap-2">
                <a
                  href={savedGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline truncate"
                >
                  {savedGithub}
                </a>
                <Button size="sm" variant="outline" onClick={deleteGithub}>
                  Delete
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
                <Button size="sm" onClick={saveGithub}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
