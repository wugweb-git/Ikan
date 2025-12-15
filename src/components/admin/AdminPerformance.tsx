import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

export function AdminPerformance() {
  const metrics = [
    { label: 'CPU Usage', value: 45, unit: '%' },
    { label: 'Memory Usage', value: 62, unit: '%' },
    { label: 'Disk Usage', value: 28, unit: '%' },
    { label: 'Network I/O', value: 15, unit: '%' },
  ];

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Performance Monitor</h2>
         <p className="text-muted-foreground">Real-time system resource utilization.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-muted-foreground">{metric.value}{metric.unit}</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {[40, 35, 55, 45, 60, 30, 45, 35, 50, 40, 55, 45].map((h, i) => (
                <div 
                  key={i} 
                  className="bg-primary/20 hover:bg-primary/40 transition-colors rounded-t w-full"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Average Response Time: 45ms
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
