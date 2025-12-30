import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AdminComponentSpecs() {
  const categories = {
    'Core UI': [
      {
        name: 'Button',
        props: [
          { name: 'variant', type: "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'", default: '"default"' },
          { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", default: '"default"' },
          { name: 'asChild', type: 'boolean', default: 'false' }
        ],
        status: 'Stable'
      },
      {
        name: 'Card',
        props: [
          { name: 'className', type: 'string', default: '""' },
          { name: 'children', type: 'ReactNode', required: true }
        ],
        status: 'Stable'
      }
    ],
    'Feature Components': [
      {
        name: 'AssessmentFlow',
        description: 'Handles the step-by-step questionnaire logic.',
        props: [
          { name: 'assessmentId', type: 'string', required: true },
          { name: 'onComplete', type: '(results: any) => void', required: true },
          { name: 'onBack', type: '() => void', required: true },
          { name: 'onNavigate', type: '(route: string) => void', required: false }
        ],
        status: 'Stable'
      },
      {
        name: 'AssessmentResults',
        description: 'Displays score, interpretation, and recommendations.',
        props: [
          { name: 'results', type: 'AssessmentResult', required: true },
          { name: 'onRetakeAssessment', type: '() => void', required: false },
          { name: 'onBackToAssessments', type: '() => void', required: false }
        ],
        status: 'Stable'
      },
      {
        name: 'EquipCard',
        description: 'Displays a program summary card.',
        props: [
          { name: 'program', type: 'Program', required: true },
          { name: 'onClick', type: '() => void', required: true }
        ],
        status: 'Stable'
      }
    ],
    'Inputs': [
      {
        name: 'TextArea',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChange', type: '(value: string) => void', required: true },
          { name: 'maxLength', type: 'number', default: 'undefined' }
        ],
        status: 'Stable'
      },
      {
        name: 'AssessmentQuestion',
        props: [
          { name: 'question', type: 'Question', required: true },
          { name: 'value', type: 'any', required: true },
          { name: 'onAnswer', type: '(id: string, val: any) => void', required: true }
        ],
        status: 'Stable'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Component Specifications</h2>
         <p className="text-muted-foreground">Technical documentation, prop definitions, and status for UI components.</p>
      </div>

      <Tabs defaultValue="Core UI" className="w-full">
        <TabsList className="mb-4">
          {Object.keys(categories).map(cat => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(categories).map(([category, components]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {components.map((comp) => (
              <Card key={comp.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="font-mono text-lg">{comp.name}</CardTitle>
                    {/* @ts-ignore */}
                    {comp.description && <p className="text-sm text-muted-foreground mt-1">{comp.description}</p>}
                  </div>
                  <Badge variant={comp.status === 'Stable' ? 'default' : 'secondary'}>{comp.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Props</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Default</th>
                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comp.props.map((prop) => (
                            <tr key={prop.name} className="border-t last:border-0 hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-2 font-mono text-blue-600">{prop.name}</td>
                              <td className="px-4 py-2 font-mono text-pink-600 text-xs">{prop.type}</td>
                              <td className="px-4 py-2 font-mono text-gray-500 text-xs">{prop.default || '-'}</td>
                              <td className="px-4 py-2">
                                {prop.required ? (
                                  <Badge variant="outline" className="text-[10px] border-red-200 text-red-700 bg-red-50">Required</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Optional</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
