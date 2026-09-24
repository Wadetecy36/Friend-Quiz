import { useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isLiveConfigured,
  checkAdminStatus,
  registerAdminRecord,
  getDemoAdminSession,
  setDemoAdminSession,
  AdminUser,
} from '../lib/supabase';

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      setLoading(true);

      if (isLiveConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Verify membership in public.admins table
            let isAdmin = await checkAdminStatus(session.user.id);
            if (!isAdmin && session.user.email) {
              await registerAdminRecord(session.user.id, session.user.email);
              isAdmin = await checkAdminStatus(session.user.id);
            }

            if (isAdmin && isMounted) {
              setAdminUser({
                id: session.user.id,
                email: session.user.email || '',
              });
            } else if (isMounted) {
              await supabase.auth.signOut();
              setAdminUser(null);
            }
          }
        } catch (err) {
          console.error('Admin session check error:', err);
        }
      } else {
        // Fallback for demo mode
        const demoUser = getDemoAdminSession();
        if (demoUser && isMounted) {
          setAdminUser(demoUser);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen to Supabase auth changes if live
    if (isLiveConfigured && supabase) {
      const client = supabase;
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (isMounted) setAdminUser(null);
        } else if (session?.user) {
          let isAdmin = await checkAdminStatus(session.user.id);
          if (!isAdmin && session.user.email) {
            await registerAdminRecord(session.user.id, session.user.email);
            isAdmin = await checkAdminStatus(session.user.id);
          }

          if (isAdmin && isMounted) {
            setAdminUser({
              id: session.user.id,
              email: session.user.email || '',
            });
          } else if (isMounted) {
            await client.auth.signOut();
            setAdminUser(null);
          }
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      const msg = 'Please enter both email and password.';
      setAuthError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    if (isLiveConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error || !data.user) {
          const msg = error?.message || 'Invalid login credentials.';
          setAuthError(msg);
          setLoading(false);
          return { success: false, error: msg };
        }

        // Verify if user exists in public.admins
        let isAdmin = await checkAdminStatus(data.user.id);
        if (!isAdmin) {
          // Attempt auto-registration if table is empty or via RPC
          await registerAdminRecord(data.user.id, cleanEmail);
          isAdmin = await checkAdminStatus(data.user.id);
        }

        if (!isAdmin) {
          await supabase.auth.signOut();
          const deniedMsg = `Access Denied: Account authenticated, but '${cleanEmail}' is not yet in public.admins.`;
          setAuthError(deniedMsg);
          setLoading(false);
          return { success: false, error: deniedMsg };
        }

        const userObj: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
        };
        setAdminUser(userObj);
        setLoading(false);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign in failed.';
        setAuthError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo Mode Simulation
    if (cleanEmail.toLowerCase() === 'admin@example.com' || cleanEmail.includes('admin') || cleanEmail.length > 3) {
      const demoUser: AdminUser = {
        id: 'demo-admin-uid-12345',
        email: cleanEmail,
      };
      setDemoAdminSession(demoUser);
      setAdminUser(demoUser);
      setLoading(false);
      return { success: true };
    } else {
      const error = 'Demo Mode: Use "admin@example.com" with any password to log in as admin.';
      setAuthError(error);
      setLoading(false);
      return { success: false, error };
    }
  };

  // Sign up handler
  const signup = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoading(true);
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      const msg = 'Please enter both an email and password.';
      setAuthError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    if (pass.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setAuthError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    if (isLiveConfigured && supabase) {
      try {
        const redirectUrl =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : undefined;

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          const msg = error.message;
          setAuthError(msg);
          setLoading(false);
          return { success: false, error: msg };
        }

        if (data.user) {
          // Always register into public.admins
          await registerAdminRecord(data.user.id, cleanEmail);

          // If session is active immediately (no email confirmation needed)
          if (data.session) {
            const userObj: AdminUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
            };
            setAdminUser(userObj);
            setLoading(false);
            return { success: true };
          } else {
            // Confirmation email sent by Supabase
            setLoading(false);
            return {
              success: true,
              requiresEmailConfirmation: true,
            };
          }
        }

        setLoading(false);
        return { success: false, error: 'Sign up failed. Please try again.' };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign up failed.';
        setAuthError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo Mode Simulation
    const demoUser: AdminUser = {
      id: `demo-admin-${Date.now()}`,
      email: cleanEmail,
    };
    setDemoAdminSession(demoUser);
    setAdminUser(demoUser);
    setLoading(false);
    return { success: true };
  };

  // Sign out
  const logout = useCallback(async () => {
    setLoading(true);
    if (isLiveConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setDemoAdminSession(null);
    setAdminUser(null);
    setLoading(false);
  }, []);

  return {
    adminUser,
    isAuthenticated: Boolean(adminUser),
    loading,
    authError,
    login,
    signup,
    logout,
    isLiveConfigured,
  };
}
