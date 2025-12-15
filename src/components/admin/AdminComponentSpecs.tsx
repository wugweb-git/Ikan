import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export function AdminComponentSpecs() {
  const components = [
    {
      name: 'Button',
      props: [
        { name: 'variant', type: 'string', default: '"default"' },
        { name: 'size', type: 'string', default: '"default"' },
        { name: 'onClick', type: 'function', required: true }
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
    },
    {
      name: 'AssessmentFlow',
      props: [
        { name: 'onComplete', type: 'function', required: true },
        { name: 'onBack', type: 'function', required: true }
      ],
      status: 'Beta'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Component Specifications</h2>
         <p className="text-muted-foreground">Technical documentation for UI components.</p>
      </div>

      <div className="grid gap-6">
        {components.map((comp) => (
          <Card key={comp.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-lg">{comp.name}</CardTitle>
              <Badge variant={comp.status === 'Stable' ? 'default' : 'secondary'}>{comp.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Props</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Default</th>
                        <th className="px-4 py-2 text-left">Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comp.props.map((prop) => (
                        <tr key={prop.name} className="border-t last:border-0">
                          <td className="px-4 py-2 font-mono text-blue-600">{prop.name}</td>
                          <td className="px-4 py-2 font-mono text-pink-600">{prop.type}</td>
                          <td className="px-4 py-2 font-mono text-gray-500">{prop.default || '-'}</td>
                          <td className="px-4 py-2">{prop.required ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
