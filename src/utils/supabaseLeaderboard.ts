import { supabase } from '../lib/supabase';

export async function submitScore(username, score) {
  const { data, error } = await supabase
    .from('public_scores')
    .insert([{ username, score }]);
  if (error) {
    alert('Failed to submit score: ' + error.message);
    return false;
  }
  alert('Score submitted!');
  return true;
}

export async function fetchLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from('public_scores')
    .select('username, score, created_at')
    .order('score', { ascending: false })
    .limit(limit);
  if (error) {
    alert('Failed to fetch leaderboard: ' + error.message);
    return [];
  }
  return data;
} 