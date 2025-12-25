'use client';

import { useState } from 'react';
import { z } from 'zod';
// Client-side navigation after successful login.
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/(main)/auth-provider';

// UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bot, LogIn } from 'lucide-react';

// Zod schema defining valid credentials
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'), 
  password: z.string().min(6, 'Password must be at least 6 characters') 
});

/**
 * LoginPage Component handles:
 * - User login (existing users)
 * - User signup (new users)
 * - Form validation with user feedback
 * - Authentication state management
 * - Navigation on successful login
 */
export default function LoginPage() {
  // Pull authentication actions
  const { login, signup } = useAuth();
  // Next.js client-side router for redirects
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Toggles between "Sign In" and "Sign Up" modes
  const [isSignUp, setIsSignUp] = useState(false);
  // Message shown to the user after validation or auth attempt
  // Success controls styling (green/red)
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  // Disables the button
  const [loading, setLoading] = useState(false);
  
 /**
   * Form Submission handles both login and signup flows:
   * - Validates input with Zod schema
   * - Shows validation errors if any
   * - Calls appropriate auth method (login/signup)
   * - Shows result message to user
   * - Redirects on successful login
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    setMessage(null); // Clear previous messages

    // Validate credentials against Zod schem
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      // Collects all validation errors into a single string
      setMessage({ text: parsed.error.errors.map(err => err.message).join(', '), success: false });
      return;
    }

    // Start authentication process
    setLoading(true);
    // Choose auth method based on current mode
    let result;
    if (isSignUp) {
      result = await signup(email, password);
    } else {
      result = await login(email, password);
    }

    // Show result to user
    setMessage({ text: result.message, success: result.success });
    setLoading(false);

    // Redirect only on successful login
    if (!isSignUp && result.success) router.push('/dashboard');
  };

    /**
   * Render Method
   * 
   * Returns a clean, centered authentication form with:
   * - Branding header
   * - Toggle between login/signup
   * - Form inputs with validation
   * - Status messages
   * - Loading states
   */
  return (
    // Full-screen centered container
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Main content wrapper with max width */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-4">
        {/* Branding header with logo */}
        <div className="flex items-center gap-2 text-primary">
          <Bot className="h-8 w-8" />
          <h1 className="text-3xl font-bold">CareerAI</h1>
        </div>

        {/* Authentication card - contains the form */}
        <Card className="w-full max-w-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-2xl">{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
              <CardDescription>
                Enter your email and password to {isSignUp ? 'create an account' : 'login'}.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* Email input field */}
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {/* Password input field */}
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* Status message display */}
              {message && (
                <p className={`text-sm ${message.success ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Submit button with loading state */}
              <Button type="submit" disabled={loading} className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
              {/* Toggle between login/signup */}
              <Button
                type="button"
                variant="link"
                className="w-full text-sm"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
