import React from 'react';

// Component to verify environment variables are accessible
export function EnvironmentCheck() {
  const checkEnv = () => {
    console.log('🔍 Environment Check:');
    
    try {
      // Test import.meta.env access
      const hasImportMeta = typeof import !== 'undefined' && import.meta;
      console.log('import.meta available:', hasImportMeta);
      
      if (hasImportMeta) {
        const env = import.meta.env;
        console.log('import.meta.env available:', !!env);
        if (env) {
          console.log('DEV:', env.DEV);
          console.log('PROD:', env.PROD);
          console.log('VITE_SUPABASE_PROJECT_ID:', env.VITE_SUPABASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
          console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
        }
      }
    } catch (error) {
      console.warn('Environment check error:', error);
    }
    
    try {
      // Test fallback approach
      const { projectId, publicAnonKey } = require('../utils/supabase/info');
      console.log('Supabase config loaded:', { 
        projectId: projectId ? '✅' : '❌', 
        publicAnonKey: publicAnonKey ? '✅' : '❌' 
      });
    } catch (error) {
      console.warn('Supabase config error:', error);
    }
  };

  React.useEffect(() => {
    checkEnv();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow-sm text-xs border opacity-50 hover:opacity-100 z-50">
      <div>Environment: {window.location.hostname}</div>
      <button 
        onClick={checkEnv}
        className="text-blue-600 underline"
      >
        Check Console
      </button>
    </div>
  );
}

export default EnvironmentCheck;