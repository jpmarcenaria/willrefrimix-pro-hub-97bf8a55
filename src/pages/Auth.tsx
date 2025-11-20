import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">WillRefrimix Admin</CardTitle>
          <CardDescription className="text-base">
            Sign in with your authorized Google account to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Only authorized accounts can access the admin panel
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
