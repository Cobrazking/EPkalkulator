import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestSupabase: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Test basic connection
        const { data, error } = await supabase
          .from('organizations')
          .select('count')
          .limit(1);

        console.log('Supabase test result:', { data, error });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Supabase tilkobling fungerer!');
        console.log('Supabase connection successful');
      } catch (error: any) {
        console.error('Supabase connection failed:', error);
        setStatus('error');
        setMessage(`Feil: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="font-semibold mb-2">Supabase Status</h3>
      <div className={`p-2 rounded ${
        status === 'loading' ? 'bg-yellow-500/10 text-yellow-400' :
        status === 'success' ? 'bg-green-500/10 text-green-400' :
        'bg-red-500/10 text-red-400'
      }`}>
        {status === 'loading' && 'Tester tilkobling...'}
        {status !== 'loading' && message}
      </div>
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-text-muted">
        <div>URL: {import.meta.env.VITE_SUPABASE_URL}</div>
        <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</div>
      </div>
    </div>
  );
};

export default TestSupabase;