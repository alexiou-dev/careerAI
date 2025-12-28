'use client';

// UI Components
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
// Authentication hook
import { useAuth } from '@/app/(main)/auth-provider';
// React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Dialog components for confirmation modals
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

/**
 * Settings Page Component
 * 
 * User account management and settings interface.
 * Features:
 * - Display user email (read-only)
 * - LinkedIn profile management (save/delete)
 * - GitHub profile management (save/delete)
 * - Logout functionality
 * - Account deletion with confirmation
 */
export default function SettingsPage() {
  // Authentication context - provides user data and logout function
  const { logout, user } = useAuth();
  const userId = user?.id ?? '';
  
  // State management for profile URLs
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [savedLinkedin, setSavedLinkedin] = useState('');
  const [savedGithub, setSavedGithub] = useState('');

  /**
   * Load saved profile URLs from localStorage on component mount
   */
  useEffect(() => {
    if (!userId) return;
    
    // Load LinkedIn URL from localStorage
    const storedLinkedin = localStorage.getItem(`${userId}-linkedin`) || '';
    // Load GitHub URL from localStorage
    const storedGithub = localStorage.getItem(`${userId}-github`) || '';
    
    // Update all state variables
    setLinkedin(storedLinkedin);
    setGithub(storedGithub);
    setSavedLinkedin(storedLinkedin);
    setSavedGithub(storedGithub);
  }, [userId]);

  /**
   * Save LinkedIn URL to localStorage
   */
  const saveLinkedin = () => {
    if (!userId) return;
    localStorage.setItem(`${userId}-linkedin`, linkedin);
    setSavedLinkedin(linkedin);
  };

  /**
   * Save GitHub URL to localStorage
   */
  const saveGithub = () => {
    if (!userId) return;
    localStorage.setItem(`${userId}-github`, github);
    setSavedGithub(github);
  };

  /**
   * Delete LinkedIn URL from localStorage
   * Clears both input and saved state
   */
  const deleteLinkedin = () => {
    if (!userId) return;
    localStorage.removeItem(`${userId}-linkedin`);
    setLinkedin('');
    setSavedLinkedin('');
  };

  /**
   * Delete GitHub URL from localStorage
   * Clears both input and saved state
   */
  const deleteGithub = () => {
    if (!userId) return;
    localStorage.removeItem(`${userId}-github`);
    setGithub('');
    setSavedGithub('');
  };

  /**
   * Handle account deletion
   * Makes API call to delete user account and cleans up local data
   */
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Call delete account API endpoint
      const res = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      // Cleanup client-side data
      localStorage.removeItem(`${user.id}-linkedin`);
      localStorage.removeItem(`${user.id}-github`);
      localStorage.removeItem("careerai-jobs");
      localStorage.removeItem("careerai-resumes");

      // Log user out after successful deletion
      logout();
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Something went wrong while deleting your account.");
    }
  };

  return (
    /* 
      MAIN PAGE CONTAINER
    */
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* 
        ACCOUNT INFORMATION CARD
        - Contains user profile management sections
        - Email display (read-only)
        - LinkedIn profile management
        - GitHub profile management
        - Logout button
      */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 
            EMAIL SECTION
            - Read-only display of user email
            - Disabled input
          */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              value={user?.email ?? ''} 
              readOnly 
              disabled 
              aria-label="User email address"
            />
          </div>

          {/* 
            LINKEDIN PROFILE SECTION
            - Two states: Saved (display link + delete) vs Edit (input + save)
            - Conditional rendering based on savedLinkedin state
          */}
          <div className="space-y-2">
            <Label>LinkedIn Profile</Label>
            
            {/* 
              SAVED STATE
              - Shows clickable link that opens in new tab
              - Delete button to remove saved URL
            */}
            {savedLinkedin ? (
              <div className="flex items-center gap-2">
                <a 
                  href={savedLinkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 underline truncate"
                  aria-label="Open LinkedIn profile"
                >
                  {savedLinkedin}
                </a>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={deleteLinkedin}
                  aria-label="Delete LinkedIn profile"
                >
                  Delete
                </Button>
              </div>
            ) : (
             
              <div className="flex gap-2">
                <Input 
                  placeholder="https://linkedin.com/in/username" 
                  value={linkedin} 
                  onChange={e => setLinkedin(e.target.value)}
                  aria-label="Enter LinkedIn profile URL"
                />
                <Button 
                  size="sm" 
                  onClick={saveLinkedin}
                  aria-label="Save LinkedIn profile"
                >
                  Save
                </Button>
              </div>
            )}
          </div>

        
          <div className="space-y-2">
            <Label>GitHub Profile</Label>
            
       
            {savedGithub ? (
              <div className="flex items-center gap-2">
                <a 
                  href={savedGithub} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 underline truncate"
                  aria-label="Open GitHub profile"
                >
                  {savedGithub}
                </a>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={deleteGithub}
                  aria-label="Delete GitHub profile"
                >
                  Delete
                </Button>
              </div>
            ) : (
             
              <div className="flex gap-2">
                <Input 
                  placeholder="https://github.com/username" 
                  value={github} 
                  onChange={e => setGithub(e.target.value)}
                  aria-label="Enter GitHub profile URL"
                />
                <Button 
                  size="sm" 
                  onClick={saveGithub}
                  aria-label="Save GitHub profile"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={logout}
            aria-label="Log out of account"
          >
            Logout
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
        
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                aria-label="Open account deletion confirmation"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>
         
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter>
     
                <AlertDialogCancel>Cancel</AlertDialogCancel>
             
                <AlertDialogAction 
                  onClick={handleDeleteAccount} 
                  className="bg-destructive hover:bg-destructive/90"
                  aria-label="Confirm account deletion"
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
