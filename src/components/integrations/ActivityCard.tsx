import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Icon } from '../Icon';
import { useGoogleFit } from './GoogleFitContext';
import { GoogleFitConsentModal } from './GoogleFitConsentModal';
import { cn } from '../ui/utils';
import { Activity, Moon, Footprints, Heart, RefreshCw } from 'lucide-react';

interface ActivityCardProps {
  className?: string;
}

export function ActivityCard({ className }: ActivityCardProps) {
  const { isConnected, isSyncing, data, connect, sync } = useGoogleFit();
  const [showConsent, setShowConsent] = useState(false);

  // Helper for metrics
  const Metric = ({ icon: Icon, label, value, unit, color }: any) => (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
      <div className={cn("p-2 rounded-full mb-2", color)}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-xl font-bold text-gray-900 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        {label}
      </div>
    </div>
  );

  // NOT CONNECTED STATE
  if (!isConnected) {
    return (
      <>
        <Card className={cn("border-dashed border-2 bg-gray-50/50", className)}>
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
              <Activity className="text-indigo-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">Sync Activity Data</h3>
              <p className="text-sm text-gray-500 max-w-[200px] mx-auto leading-relaxed">
                Connect Google Fit to see how your sleep & movement affect your mood.
              </p>
            </div>
            <Button 
              onClick={() => setShowConsent(true)}
              variant="outline"
              className="rounded-full bg-white hover:bg-gray-50 border-gray-200 text-indigo-600 font-medium"
            >
              Connect Google Fit
            </Button>
          </CardContent>
        </Card>
        
        <GoogleFitConsentModal 
          isOpen={showConsent}
          onClose={() => setShowConsent(false)}
          onConfirm={() => {
            connect();
            setShowConsent(false);
          }}
        />
      </>
    );
  }

  // CONNECTED STATE
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm ring-1 ring-black/5 bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity size={18} className="text-indigo-500" />
          Today's Activity
        </CardTitle>
        <button 
          onClick={() => sync()} 
          disabled={isSyncing}
          className={cn(
            "p-2 rounded-full hover:bg-gray-100 transition-all",
            isSyncing && "animate-spin text-indigo-500"
          )}
        >
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {data ? (
          <div className="grid grid-cols-2 gap-3">
             <Metric 
               icon={Footprints} 
               label="Steps" 
               value={data.steps.toLocaleString()} 
               color="bg-orange-500" 
             />
             <Metric 
               icon={Moon} 
               label="Sleep" 
               value={data.sleepHours + 'h'} 
               color="bg-indigo-500" 
             />
             <Metric 
               icon={Activity} 
               label="Active" 
               value={data.activeMinutes + 'm'} 
               color="bg-emerald-500" 
             />
             <Metric 
               icon={Heart} 
               label="RHR" 
               value={data.restingHeartRate} 
               color="bg-rose-500" 
             />
          </div>
        ) : (
           <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
             No data available yet.
           </div>
        )}
        
        <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Synced with Google Fit • Read-only
        </div>
      </CardContent>
    </Card>
  );
}