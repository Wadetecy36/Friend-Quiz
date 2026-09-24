import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ResponseRecord } from './utils';

// Read config from Vite environment or localStorage override
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getStoredConfig(): { url: string; key: string } {
  try {
    const raw = localStorage.getItem('supabase_custom_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key };
      }
    }
  } catch {
    // ignore
  }
  return {
    url: (envUrl as string) || '',
    key: (envKey as string) || '',
  };
}

const currentConfig = getStoredConfig();

export const isLiveConfigured = Boolean(
  currentConfig.url &&
    currentConfig.key &&
    !currentConfig.url.includes('your-project') &&
    !currentConfig.key.includes('your-anon')
);

// Instantiate client if configured
let supabaseInstance: SupabaseClient | null = null;

if (isLiveConfigured) {
  try {
    supabaseInstance = createClient(currentConfig.url, currentConfig.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = supabaseInstance;

export function updateCustomSupabaseConfig(url: string, key: string) {
  localStorage.setItem('supabase_custom_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
  window.location.reload();
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem('supabase_custom_config');
  window.location.reload();
}

// ============================================================================
// DEMO / FALLBACK STORAGE (for immediate preview when keys are not yet provided)
// ============================================================================
const DEMO_RESPONSES_KEY = 'demo_responses_db';
const DEMO_ADMIN_SESSION_KEY = 'demo_admin_session';

function initDemoData(): ResponseRecord[] {
  const existing = localStorage.getItem(DEMO_RESPONSES_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }

  const initial: ResponseRecord[] = [
    {
      id: 'd9b7348e-6701-44be-83f0-4642fb2fca11',
      participant_name: 'Alex Parker',
      answers: {
        q1: 'Alexander',
        q2: 'Artisanal Pizza & Pasta',
        q3: 9,
        q4: 'Iced Oat Milk Latte / Flat White',
        q5: 'Slow walkers on narrow sidewalks',
        q6: 8,
        q7: 'Electric Metropolis (Tokyo, Seoul, NYC)',
        q8: 'Indie Rock & Daft Punk',
        q9: 2,
        q10: 'Cooking a relaxed gourmet meal with playlist on',
        q11: 'Can identify almost any font at a glance',
        q12: 7,
      },
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 2 + 1800000).toISOString(),
    },
    {
      id: 'e48a1290-0982-4112-9cbb-99f2b87e221b',
      participant_name: 'Maya Lin',
      answers: {
        q1: 'James',
        q2: 'Fresh Sushi & Spicy Ramen',
        q3: 8,
        q4: 'Matcha Green Tea Latte',
        q5: 'When people don’t put their shopping carts back',
        q6: 5,
        q7: 'Secluded Alpine Cabin in the Mountains',
      },
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    },
  ];

  localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(initial));
  return initial;
}

function getDemoResponses(): ResponseRecord[] {
  return initDemoData();
}

function saveDemoResponses(list: ResponseRecord[]) {
  localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(list));
}

// ============================================================================
// DATA ACCESS LAYER: Handles Live Supabase OR Seamless Demo Emulation
// ============================================================================

/**
 * Atomic Name Claim
 */
export async function claimParticipantName(
  name: string
): Promise<{ success: boolean; error?: string; isSchemaMissing?: boolean; isRecursionError?: boolean }> {
  const cleanName = name.trim();
  if (!cleanName) {
    return { success: false, error: 'Please enter a valid name.' };
  }

  if (supabase) {
    try {
      // 1. Try atomic RPC function claim_name
      const { data, error } = await supabase.rpc('claim_name', { p_name: cleanName });

      if (!error) {
        if (data === false) {
          return {
            success: false,
            error: 'That name has already been claimed! Please choose another nickname.',
          };
        }
        return { success: true };
      }

      // Check for infinite recursion error
      if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
        return {
          success: false,
          isRecursionError: true,
          error:
            'Infinite recursion detected in Supabase RLS policy for relation "admins". Please run the SQL fix in your Supabase SQL Editor, or switch to Demo Mode.',
        };
      }

      // Check if error was a unique violation
      if (error.message?.includes('unique') || error.code === '23505') {
        return {
          success: false,
          error: 'That name has already been claimed! Please choose another nickname.',
        };
      }

      // 2. If RPC function was missing (PGRST202 or message contains "Could not find the function"),
      // fallback to direct table check & insert
      const isMissingFunction =
        error.code === 'PGRST202' ||
        error.code === '42883' ||
        error.message?.includes('Could not find the function');

      if (isMissingFunction) {
        // Check if table exists and if name is taken
        const { data: existing, error: checkError } = await supabase
          .from('responses')
          .select('id, participant_name')
          .ilike('participant_name', cleanName)
          .maybeSingle();

        if (checkError?.code === '42P17' || checkError?.message?.includes('infinite recursion')) {
          return {
            success: false,
            isRecursionError: true,
            error:
              'Infinite recursion detected in Supabase RLS policy for relation "admins". Please run the SQL fix in your Supabase SQL Editor.',
          };
        }

        if (existing) {
          return {
            success: false,
            error: 'That name has already been claimed! Please choose another nickname.',
          };
        }

        if (!checkError) {
          // Table exists! Insert row directly
          const { error: insertError } = await supabase
            .from('responses')
            .insert({ participant_name: cleanName, answers: {} });

          if (!insertError) {
            return { success: true };
          }

          if (insertError.code === '42P17' || insertError.message?.includes('infinite recursion')) {
            return {
              success: false,
              isRecursionError: true,
              error:
                'Infinite recursion detected in Supabase RLS policy for relation "admins". Please run the SQL fix in your Supabase SQL Editor.',
            };
          }

          if (insertError.code === '23505' || insertError.message?.includes('unique')) {
            return {
              success: false,
              error: 'That name has already been claimed! Please choose another nickname.',
            };
          }
        }

        // If table also doesn't exist (42P01, PGRST200, relation does not exist)
        const isTableMissing =
          checkError?.code === '42P01' ||
          checkError?.code === 'PGRST200' ||
          checkError?.message?.includes('does not exist') ||
          checkError?.message?.includes('schema cache');

        if (isTableMissing || checkError) {
          return {
            success: false,
            isSchemaMissing: true,
            error:
              'Supabase database connected, but the SQL migration (tables & RPC) has not been run yet in your Supabase SQL Editor.',
          };
        }
      }

      return { success: false, error: error.message };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to claim name';
      return { success: false, error: msg };
    }
  }

  // Demo fallback:
  const list = getDemoResponses();
  const existing = list.find((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return {
      success: false,
      error: 'That name has already been taken in this questionnaire! Please try another nickname.',
    };
  }

  const newRecord: ResponseRecord = {
    id: crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
    participant_name: cleanName,
    answers: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  list.push(newRecord);
  saveDemoResponses(list);
  return { success: true };
}

/**
 * Set session context for RLS
 */
export async function setParticipantContext(name: string): Promise<void> {
  const cleanName = name.trim();
  if (!cleanName) return;

  if (supabase) {
    try {
      await supabase.rpc('set_participant_context', { p_name: cleanName });
    } catch (err) {
      console.warn('RPC set_participant_context failed, will rely on query matching:', err);
    }
  }
}

// Track if RLS infinite recursion has been encountered on the remote Supabase database
let isRecursionDetected = false;

export function getIsRecursionDetected(): boolean {
  return isRecursionDetected;
}

export function resetRecursionDetected(): void {
  isRecursionDetected = false;
}

/**
 * Fetch participant's own responses
 */
export async function getParticipantResponse(name: string): Promise<ResponseRecord | null> {
  const cleanName = name.trim();
  if (!cleanName) return null;

  // If infinite recursion was already detected on the database, use local storage
  // to avoid repeated failing requests and console spam
  if (isRecursionDetected) {
    const list = getDemoResponses();
    const found = list.find((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
    return found || null;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('participant_name', cleanName)
        .maybeSingle();

      if (error) {
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          isRecursionDetected = true;
          console.warn('Supabase RLS policy recursion detected (code 42P17). Silently falling back to local session while waiting for SQL patch.');
        } else {
          console.warn('Notice when fetching participant response:', error.message);
        }

        // Fall back to local demo storage so the participant can continue smoothly
        const list = getDemoResponses();
        const found = list.find((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
        return found || null;
      }
      return data as ResponseRecord | null;
    } catch (err) {
      console.warn('Notice querying responses:', err);
      const list = getDemoResponses();
      const found = list.find((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
      return found || null;
    }
  }

  // Demo fallback:
  const list = getDemoResponses();
  const found = list.find((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
  return found || null;
}

/**
 * Auto-save answers debounced
 */
export async function updateParticipantAnswers(
  name: string,
  answers: Record<string, unknown>
): Promise<{ success: boolean; error?: string; isRecursionError?: boolean }> {
  const cleanName = name.trim();
  if (!cleanName) return { success: false, error: 'No participant name' };

  // Always back up locally first so user work is 100% safe
  const list = getDemoResponses();
  const idx = list.findIndex((r) => r.participant_name.toLowerCase() === cleanName.toLowerCase());
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      answers: answers as Record<string, string | number>,
      updated_at: new Date().toISOString(),
    };
    saveDemoResponses(list);
  } else {
    list.push({
      id: crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
      participant_name: cleanName,
      answers: answers as Record<string, string | number>,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    saveDemoResponses(list);
  }

  // If recursion is already detected on the database, succeed via local storage
  if (isRecursionDetected) {
    return { success: true, isRecursionError: true };
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('responses')
        .update({
          answers,
          updated_at: new Date().toISOString(),
        })
        .eq('participant_name', cleanName);

      if (error) {
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          isRecursionDetected = true;
          console.warn('Supabase RLS recursion on save. Answers safely stored in local session.');
          return {
            success: true, // Saved to local storage fallback
            isRecursionError: true,
            error: 'Policy recursion in Supabase. Answers saved locally! Run the policy fix in Supabase SQL editor.',
          };
        }

        console.warn('Notice auto-saving to Supabase:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      return { success: false, error: msg };
    }
  }

  return { success: true };
}

/**
 * Admin: Get all responses
 */
export async function getAllResponses(): Promise<{ data: ResponseRecord[]; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          isRecursionDetected = true;
          console.warn('Infinite recursion detected in Supabase RLS policies for admins.');
          return {
            data: getDemoResponses(),
            error:
              'Infinite recursion detected in Supabase RLS policies for admins. Run the 4-line SQL patch in your Supabase SQL editor.',
          };
        }
        return { data: getDemoResponses(), error: error.message };
      }
      return { data: (data as ResponseRecord[]) || [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch responses';
      return { data: [], error: msg };
    }
  }

  return { data: getDemoResponses() };
}

/**
 * Admin: Get single response by UUID
 */
export async function getResponseById(id: string): Promise<{ data: ResponseRecord | null; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }
      return { data: data as ResponseRecord };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch response';
      return { data: null, error: msg };
    }
  }

  const list = getDemoResponses();
  const found = list.find((r) => r.id === id);
  return { data: found || null };
}

/**
 * Admin: Delete a response
 */
export async function deleteResponseById(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('responses').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      return { success: false, error: msg };
    }
  }

  const list = getDemoResponses();
  const filtered = list.filter((r) => r.id !== id);
  saveDemoResponses(filtered);
  return { success: true };
}

/**
 * Admin Authentication Helpers
 */
export interface AdminUser {
  id: string;
  email: string;
}

export async function checkAdminStatus(userId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return false;
      return true;
    } catch {
      return false;
    }
  }

  // Demo fallback
  const session = localStorage.getItem(DEMO_ADMIN_SESSION_KEY);
  return Boolean(session);
}

/**
 * Register user in admins table after Supabase signup
 */
export async function registerAdminRecord(
  userId: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();

  if (supabase) {
    try {
      // 1. First try RPC register_admin_user
      const { data: rpcSuccess, error: rpcError } = await supabase.rpc('register_admin_user', {
        p_email: cleanEmail,
      });

      if (!rpcError && rpcSuccess === true) {
        return { success: true };
      }

      // 2. Direct upsert into public.admins
      const { error: insertError } = await supabase
        .from('admins')
        .upsert({ id: userId, email: cleanEmail }, { onConflict: 'id' });

      if (insertError) {
        console.warn('Notice during admin table registration:', insertError.message);
        // Verify if user is already recorded
        const isNowAdmin = await checkAdminStatus(userId);
        if (isNowAdmin) {
          return { success: true };
        }
        return { success: false, error: insertError.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register admin profile';
      return { success: false, error: msg };
    }
  }

  // Demo mode
  return { success: true };
}

export function getDemoAdminSession(): AdminUser | null {
  const raw = localStorage.getItem(DEMO_ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setDemoAdminSession(user: AdminUser | null) {
  if (user) {
    localStorage.setItem(DEMO_ADMIN_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
  }
}
