import { useEffect, useCallback } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  const isActive = useCallback(
    (path: string) => location.pathname.startsWith(path),
    [location.pathname]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, [signOut, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Acesso restrito</h1>
          <p className="text-muted-foreground">Sua conta não possui permissão para acessar o painel administrativo.</p>
          <div className="flex justify-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" aria-label="View public site">
                <Home className="mr-2 h-4 w-4" />
                Ir para o site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/admin"
              aria-label="WillRefrimix Admin Home"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              WillRefrimix Admin
            </Link>
            <nav className="hidden md:flex items-center gap-4" aria-label="Admin Navigation">
              <Link to="/">
                <Button variant="ghost" size="sm" aria-label="View public site">
                  <Home className="mr-2 h-4 w-4" />
                  View Site
                </Button>
              </Link>
              <Link to="/admin/posts">
                <Button
                  variant={isActive('/admin/posts') ? 'default' : 'ghost'}
                  size="sm"
                  aria-label={isActive('/admin/posts') ? 'Current page: Posts' : 'Go to Posts'}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Posts
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline" aria-label={`Logged in as ${user?.email ?? ''}`}>
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline" size="sm" aria-label="Sign out">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
