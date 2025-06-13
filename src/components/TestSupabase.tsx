import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TestSupabase: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('organizations')
          .select('count')
          .limit(1);

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Supabase tilkobling fungerer!');
      } catch (error: any) {
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
    </div>
  );
};

export default TestSupabase;