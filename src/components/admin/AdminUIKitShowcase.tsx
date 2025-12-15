import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

export function AdminUIKitShowcase() {
  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">UI Kit Showcase</h2>
         <p className="text-muted-foreground">Interactive catalog of all available UI elements.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Input</Label>
              <Input placeholder="example@email.com" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Toggle Switch</Label>
            </div>
            <div className="space-y-2">
               <Label>Slider</Label>
               <Slider defaultValue={[50]} max={100} step={1} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Heading 1
            </h1>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Heading 2
            </h2>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Heading 3
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              The king, seeing how much happier his subjects were, realized the error of his ways and repealed the joke tax.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
