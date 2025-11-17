import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testSupabaseConnection, SupabaseTestResult } from '@/utils/supabaseTest';

const SupabaseTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        connection: false,
        auth: false,
        database: false,
        functions: false,
        errors: [`Test failed: ${error.message}`],
        details: { config: {}, tables: [], functions: [] }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (status: boolean) => {
    return status ? '✅ Working' : '❌ Failed';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Supabase Connection Test
            <Button 
              onClick={runTest} 
              disabled={isLoading}
              className="ml-auto"
            >
              {isLoading ? 'Testing...' : 'Run Test'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResult && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge className={`${getStatusColor(testResult.connection)} text-white mb-2`}>
                    {getStatusText(testResult.connection)}
                  </Badge>
                  <p className="text-sm font-medium">Connection</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getStatusColor(testResult.auth)} text-white mb-2`}>
                    {getStatusText(testResult.auth)}
                  </Badge>
                  <p className="text-sm font-medium">Authentication</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getStatusColor(testResult.database)} text-white mb-2`}>
                    {getStatusText(testResult.database)}
                  </Badge>
                  <p className="text-sm font-medium">Database</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getStatusColor(testResult.functions)} text-white mb-2`}>
                    {getStatusText(testResult.functions)}
                  </Badge>
                  <p className="text-sm font-medium">Edge Functions</p>
                </div>
              </div>

              {/* Configuration Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Configuration</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(testResult.details.config, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Working Tables */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Database Tables ({testResult.details.tables.length} accessible)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {testResult.details.tables.map((table) => (
                    <Badge key={table} className="bg-green-100 text-green-800">
                      ✅ {table}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Edge Functions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Edge Functions ({testResult.details.functions.length} configured)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {testResult.details.functions.map((func) => (
                    <Badge key={func} className="bg-blue-100 text-blue-800">
                      ⚡ {func}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {testResult.errors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600">
                    Errors ({testResult.errors.length})
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    {testResult.errors.map((error, index) => (
                      <div key={index} className="text-red-700 text-sm mb-2">
                        ❌ {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Summary</h3>
                <p className="text-blue-700">
                  {testResult.connection && testResult.database 
                    ? '✅ Your Supabase is working correctly! The connection, database, and basic functionality are operational.'
                    : '❌ There are issues with your Supabase setup. Please check the errors above and ensure your configuration is correct.'
                  }
                </p>
                {testResult.functions && (
                  <p className="text-blue-700 mt-2">
                    ✅ Edge functions are accessible and ready for use.
                  </p>
                )}
              </div>
            </div>
          )}

          {!testResult && (
            <div className="text-center text-gray-500 py-8">
              Click "Run Test" to check your Supabase connection
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseTestComponent; 