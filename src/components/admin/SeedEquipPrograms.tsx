import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { apiClient } from '../../lib/api-client';
import { AlertCircle, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Separator } from '../ui/separator';

// Import Programs
import { burnoutProgramData } from './programs/burnout';
import { stressProgramData } from './programs/stress';
import { productivityProgramData } from './programs/productivity';
import { sleepProgramData } from './programs/sleep';
// Anxiety and Mood programs temporarily removed until content is ready
// import { anxietyProgramData } from './programs/anxiety';
// import { moodProgramData } from './programs/mood';

// Import Assessments
import { 
  stressAssessmentData, 
  sleepAssessmentData, 
  burnoutAssessmentData,
  balanceAssessmentData,
  generalAssessmentData,
  anxietyAssessmentData,
  depressionAssessmentData
} from './assessments/data';

export function SeedEquipPrograms() {
  const [loading, setLoading] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const seedProgram = async (programData: any) => {
    setLoading(programData.title);
    setLog(prev => [...prev, `Starting seed for ${programData.title}...`]);
    
    try {
      const program = await apiClient.createEquipProgram(programData);
      setLog(prev => [...prev, `Success: ${programData.title} created (ID: ${program.id})`]);
    } catch (e: any) {
      console.error(e);
      setLog(prev => [...prev, `Error seeding ${programData.title}: ${e.message}`]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seed Equip Programs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-gray-500">
          Use these tools to populate the database with sample Equip programs for testing the UI.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
             <h3 className="font-bold mb-2">Sleep Tight</h3>
             <p className="text-xs text-gray-500 mb-4">33 Days • CBT-I • Beginner</p>
             <Button 
               onClick={() => seedProgram(sleepProgramData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === 'Sleep Tight' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed Sleep
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
             <h3 className="font-bold mb-2">Burnout Reset</h3>
             <p className="text-xs text-gray-500 mb-4">33 Days • Resilience • Intermediate</p>
             <Button 
               onClick={() => seedProgram(burnoutProgramData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === 'Burnout Reset' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed Burnout
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-red-500">
             <h3 className="font-bold mb-2">Stress Buster</h3>
             <p className="text-xs text-gray-500 mb-4">31 Days • Resilience • Beginner</p>
             <Button 
               onClick={() => seedProgram(stressProgramData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === 'Stress Buster' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed Stress
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-yellow-500">
             <h3 className="font-bold mb-2">Productivity Reset</h3>
             <p className="text-xs text-gray-500 mb-4">8 Days • Focus • Beginner</p>
             <Button 
               onClick={() => seedProgram(productivityProgramData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === 'Productivity Reset' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed Productivity
             </Button>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Assessments</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Stress</h3>
             <p className="text-xs text-gray-500 mb-4">Worried & Stressed</p>
             <Button 
               onClick={() => seedProgram(stressAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === stressAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Sleep</h3>
             <p className="text-xs text-gray-500 mb-4">Quality Sleep</p>
             <Button 
               onClick={() => seedProgram(sleepAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === sleepAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Burnout</h3>
             <p className="text-xs text-gray-500 mb-4">Drained & Burned Out</p>
             <Button 
               onClick={() => seedProgram(burnoutAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === burnoutAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Balance</h3>
             <p className="text-xs text-gray-500 mb-4">Balancing Life</p>
             <Button 
               onClick={() => seedProgram(balanceAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === balanceAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">General</h3>
             <p className="text-xs text-gray-500 mb-4">Well-Being Check</p>
             <Button 
               onClick={() => seedProgram(generalAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === generalAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Anxiety</h3>
             <p className="text-xs text-gray-500 mb-4">Overwhelmed & Anxious</p>
             <Button 
               onClick={() => seedProgram(anxietyAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === anxietyAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>

          <Card className="p-4 border-l-4 border-l-indigo-500">
             <h3 className="font-bold mb-2">Depression</h3>
             <p className="text-xs text-gray-500 mb-4">Depressed & Hopeless</p>
             <Button 
               onClick={() => seedProgram(depressionAssessmentData)} 
               disabled={!!loading}
               className="w-full"
               variant="secondary"
             >
               {loading === depressionAssessmentData.title && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Seed
             </Button>
          </Card>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-md text-xs font-mono max-h-60 overflow-y-auto">
          <div className="text-gray-500 mb-2">// Activity Log</div>
          {log.length === 0 && <span className="opacity-50">Waiting for action...</span>}
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </CardContent>
    </Card>
  );
}
