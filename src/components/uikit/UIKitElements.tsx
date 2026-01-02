import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { availableIcons } from '../../components/Icon';
import { Heart, Mail, Lock } from 'lucide-react';

export function UIKitElements() {
  return (
    <div className="space-y-8">
      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>
            Height: 48px, Radius: 12px (--radius-md).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link Button</Button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small (36px)</Button>
            <Button size="default">Default (48px)</Button>
            <Button size="lg">Large (56px)</Button>
            <Button size="icon"><Heart className="w-4 h-4" /></Button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Button disabled>Disabled</Button>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              With Icon
            </Button>
            <Button variant="outline">
              Loading...
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges / Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Tags</CardTitle>
          <CardDescription>
            Used for status indicators, categories, and labels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Icons */}
      <Card>
        <CardHeader>
          <CardTitle>System Icons</CardTitle>
          <CardDescription>
            Lucide React icons mapped to semantic names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {availableIcons.map((iconName) => (
              <div key={iconName} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon name={iconName} size={24} className="mb-2" />
                <span className="text-xs text-muted-foreground text-center break-all">{iconName}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
