import { supabase } from './supabase';

export async function updateUserActivity(userId) {
  if (!userId) return;
  
  try {
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating activity:', error);
  }
}

export function isUserActive(lastActiveAt) {
  if (!lastActiveAt) return false;
  
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
  return new Date(lastActiveAt) > fiveMinutesAgo;
}
