import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Logo } from '../Logo';
import { Lock, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface AdminLoginScreenProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: () => void;
}

export function AdminLoginScreen({ onNavigate, onLoginSuccess }: AdminLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { showToast } = useNotifications();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Missing Credentials', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Ideally, we would check for admin role here
      // const profile = await apiClient.getProfile();
      // if (profile.role !== 'admin') throw new Error('Unauthorized access');

      showToast('success', 'Welcome Back', 'Successfully logged into Admin Console');
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login failed:', error);
      showToast('error', 'Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="bg-[var(--color-primary-default)] p-3 rounded-xl mb-4 shadow-lg shadow-primary/20">
                <Logo showText={false} iconSize={32} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                Admin Console
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
                Secure access for administrators only
            </p>
        </div>

        <Card className="border-t-4 border-t-[var(--color-primary-default)] shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Sign in</CardTitle>
                <CardDescription>
                    Enter your admin credentials to continue
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@ikan.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-gray-50"
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button 
                        type="submit" 
                        className="w-full h-11 text-base bg-[var(--color-primary-default)] hover:bg-[var(--color-primary-dark)] text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4 mr-2" />
                                Sign In
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>

        <div className="text-center">
            <Button 
                variant="ghost" 
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                onClick={() => onNavigate('/')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Application
            </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-status-warning)] bg-amber-50 p-3 rounded-lg border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            <span>Authorized personnel only. All activities are logged.</span>
        </div>
      </div>
    </div>
  );
}