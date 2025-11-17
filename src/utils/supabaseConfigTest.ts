// Utility to test and display Supabase configuration
export const testSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('🔧 Supabase Configuration Test:');
  console.log('================================');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Not set');
  
  if (supabaseUrl) {
    console.log('URL Preview:', supabaseUrl.substring(0, 30) + '...');
    console.log('Is valid Supabase URL:', supabaseUrl.includes('supabase.co') ? '✅ Yes' : '❌ No');
  }
  
  if (supabaseAnonKey) {
    console.log('Key Preview:', supabaseAnonKey.substring(0, 20) + '...');
    console.log('Is valid JWT format:', supabaseAnonKey.startsWith('eyJ') ? '✅ Yes' : '❌ No');
  }
  
  const isValid = supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co');
  console.log('================================');
  console.log('Overall Status:', isValid ? '✅ Valid Configuration' : '❌ Invalid Configuration');
  console.log('================================');
  
  return isValid;
};

// Export for use in components
export default testSupabaseConfig;
