import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/supabaseConfig';

export interface SupabaseTestResult {
  connection: boolean;
  auth: boolean;
  database: boolean;
  functions: boolean;
  errors: string[];
  details: {
    config: any;
    tables: string[];
    functions: string[];
  };
}

/**
 * Comprehensive Supabase connection test
 */
export const testSupabaseConnection = async (): Promise<SupabaseTestResult> => {
  const result: SupabaseTestResult = {
    connection: false,
    auth: false,
    database: false,
    functions: false,
    errors: [],
    details: {
      config: {},
      tables: [],
      functions: []
    }
  };

  try {
    // Test 1: Configuration
    console.log('🔧 Testing Supabase configuration...');
    result.details.config = {
      url: SUPABASE_CONFIG.URL,
      hasAnonKey: !!SUPABASE_CONFIG.ANON_KEY,
      isValid: SUPABASE_CONFIG.isValid(),
      projectId: SUPABASE_CONFIG.PROJECT_ID
    };

    if (!SUPABASE_CONFIG.isValid()) {
      result.errors.push('Invalid Supabase configuration');
      return result;
    }

    // Test 2: Basic Connection
    console.log('🔌 Testing basic connection...');
    const { data: healthData, error: healthError } = await supabase
      .from('user_profiles')
      .select('pi_user_id')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST116') {
      result.errors.push(`Connection failed: ${healthError.message}`);
      return result;
    }

    result.connection = true;
    console.log('✅ Basic connection successful');

    // Test 3: Authentication
    console.log('🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      result.errors.push(`Auth test failed: ${authError.message}`);
    } else {
      result.auth = true;
      console.log('✅ Authentication working');
    }

    // Test 4: Database Tables
    console.log('🗄️ Testing database tables...');
    const tables = Object.values(SUPABASE_CONFIG.TABLES);
    const tableTests = await Promise.allSettled(
      tables.map(async (table) => {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        return { table, error };
      })
    );

    const workingTables = tableTests
      .filter((test) => test.status === 'fulfilled' && !test.value.error)
      .map((test) => (test as any).value.table);

    result.details.tables = workingTables;
    result.database = workingTables.length > 0;
    
    if (workingTables.length < tables.length) {
      result.errors.push(`Some tables not accessible: ${tables.filter(t => !workingTables.includes(t)).join(', ')}`);
    }

    console.log(`✅ Database test: ${workingTables.length}/${tables.length} tables accessible`);

    // Test 5: Edge Functions
    console.log('⚡ Testing edge functions...');
    const functions = Object.values(SUPABASE_CONFIG.FUNCTIONS);
    result.details.functions = functions;

    // Test one function (pi-auth) as a sample
    try {
      const response = await fetch(`${SUPABASE_CONFIG.URL}/functions/v1/pi-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
        },
        body: JSON.stringify({
          accessToken: 'test',
          piUserId: 'test',
          username: 'test'
        })
      });

      if (response.status !== 400) { // 400 is expected for invalid test data
        result.errors.push('Edge functions may not be properly deployed');
      } else {
        result.functions = true;
        console.log('✅ Edge functions accessible');
      }
    } catch (funcError) {
      result.errors.push(`Edge function test failed: ${funcError.message}`);
    }

    console.log('🎉 Supabase test completed!');
    return result;

  } catch (error) {
    result.errors.push(`Test failed: ${error.message}`);
    return result;
  }
};

/**
 * Quick connection check
 */
export const quickSupabaseCheck = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .select('pi_user_id')
      .limit(1);
    
    return !error || error.code === 'PGRST116'; // No rows is still a successful connection
  } catch {
    return false;
  }
};

/**
 * Test specific table access
 */
export const testTableAccess = async (tableName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return { 
      success: !error || error.code === 'PGRST116',
      error: error?.message 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export default testSupabaseConnection; 