import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader2, Database, AlertTriangle } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: any;
}

const TestSupabase: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { test: 'Connection', status: 'loading', message: 'Testing connection...' },
    { test: 'Database', status: 'loading', message: 'Checking database...' },
    { test: 'Tables', status: 'loading', message: 'Verifying tables...' }
  ]);

  const updateTest = (testName: string, status: 'success' | 'error', message: string, details?: any) => {
    setTests(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, details }
        : test
    ));
  };

  useEffect(() => {
    const runTests = async () => {
      console.log('🧪 Starting Supabase tests...');

      // Test 1: Basic connection
      try {
        console.log('Test 1: Testing basic connection...');
        const { data, error } = await supabase.from('organizations').select('count').limit(1);
        
        if (error) {
          console.error('Connection test failed:', error);
          updateTest('Connection', 'error', `Connection failed: ${error.message}`, error);
          updateTest('Database', 'error', 'Skipped due to connection failure');
          updateTest('Tables', 'error', 'Skipped due to connection failure');
          return;
        }

        console.log('✓ Connection test passed');
        updateTest('Connection', 'success', 'Connected successfully');

        // Test 2: Database access
        console.log('Test 2: Testing database access...');
        const { data: dbData, error: dbError } = await supabase
          .from('organizations')
          .select('*')
          .limit(1);

        if (dbError) {
          console.error('Database test failed:', dbError);
          updateTest('Database', 'error', `Database error: ${dbError.message}`, dbError);
          updateTest('Tables', 'error', 'Skipped due to database error');
          return;
        }

        console.log('✓ Database test passed');
        updateTest('Database', 'success', 'Database accessible');

        // Test 3: Check all tables
        console.log('Test 3: Checking all tables...');
        const tables = ['organizations', 'users', 'customers', 'projects', 'calculators', 'user_settings'];
        const tableResults = [];

        for (const table of tables) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('count')
              .limit(1);

            if (error) {
              console.error(`Table ${table} error:`, error);
              tableResults.push(`${table}: ❌ ${error.message}`);
            } else {
              console.log(`✓ Table ${table} accessible`);
              tableResults.push(`${table}: ✅`);
            }
          } catch (err) {
            console.error(`Table ${table} exception:`, err);
            tableResults.push(`${table}: ❌ Exception`);
          }
        }

        updateTest('Tables', 'success', `All tables checked`, tableResults);
        console.log('🎉 All Supabase tests completed');

      } catch (error: any) {
        console.error('Supabase test suite failed:', error);
        updateTest('Connection', 'error', `Test suite failed: ${error.message}`, error);
        updateTest('Database', 'error', 'Skipped due to test failure');
        updateTest('Tables', 'error', 'Skipped due to test failure');
      }
    };

    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  const overallStatus = tests.every(t => t.status === 'success') ? 'success' :
                       tests.some(t => t.status === 'error') ? 'error' : 'loading';

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`p-4 rounded-lg border ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" />
          <div>
            <h4 className="font-semibold">
              {overallStatus === 'success' && 'Supabase fungerer perfekt! 🎉'}
              {overallStatus === 'error' && 'Supabase har problemer ⚠️'}
              {overallStatus === 'loading' && 'Tester Supabase...'}
            </h4>
            <p className="text-sm opacity-80">
              {overallStatus === 'success' && 'Alle tester bestått - databasen er klar til bruk'}
              {overallStatus === 'error' && 'Noen tester feilet - sjekk detaljene under'}
              {overallStatus === 'loading' && 'Kjører tester for å verifisere tilkoblingen'}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Tests */}
      <div className="space-y-2">
        {tests.map((test) => (
          <div key={test.test} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.test}</span>
              </div>
              <span className="text-sm opacity-80">{test.message}</span>
            </div>
            
            {test.details && (
              <div className="mt-2 p-2 bg-background-darker/50 rounded text-xs font-mono">
                {Array.isArray(test.details) ? (
                  <div className="space-y-1">
                    {test.details.map((detail, i) => (
                      <div key={i}>{detail}</div>
                    ))}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(test.details, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Environment Info */}
      <div className="p-3 bg-background-darker/30 rounded-lg border border-border">
        <h5 className="font-medium mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Environment Info
        </h5>
        <div className="text-xs space-y-1 font-mono">
          <div>URL: {import.meta.env.VITE_SUPABASE_URL}</div>
          <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 
            `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
            'Missing'
          }</div>
          <div>Mode: {import.meta.env.MODE}</div>
          <div>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default TestSupabase;