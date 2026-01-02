import React, { useState } from 'react';
import { 
  Palette, Type, Layout, CheckSquare, Bell, 
  Image as ImageIcon, Compass, PenTool, Layers
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PageHero } from '../ui/PageHero';
import { UIKitFoundations } from '../uikit/UIKitFoundations';
import { UIKitElements } from '../uikit/UIKitElements';
import { UIKitForms } from '../uikit/UIKitForms';
import { UIKitComplexForms } from '../uikit/UIKitComplexForms';
import { UIKitNavigation } from '../uikit/UIKitNavigation';
import { UIKitNavigationPatterns } from '../uikit/UIKitNavigationPatterns';
import { UIKitFeedback } from '../uikit/UIKitFeedback';
import { UIKitDataDisplay } from '../uikit/UIKitDataDisplay';
import { UIKitPatterns } from '../uikit/UIKitPatterns';

export function UIKitShowcase() {
  const [activeTab, setActiveTab] = useState('foundations');

  const tabs = [
    { id: 'foundations', label: 'Foundations', icon: Palette },
    { id: 'elements', label: 'Elements', icon: Type },
    { id: 'forms', label: 'Basic Forms', icon: CheckSquare },
    { id: 'complex-forms', label: 'Complex Forms', icon: PenTool },
    { id: 'navigation', label: 'Navigation', icon: Compass },
    { id: 'nav-patterns', label: 'Nav Patterns', icon: Compass },
    { id: 'feedback', label: 'Feedback', icon: Bell },
    { id: 'data', label: 'Data Display', icon: ImageIcon },
    { id: 'patterns', label: 'UI Patterns', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] pb-20">
      <PageHero 
        title="iKan UI Kit"
        subtitle="The single source of truth for our design system."
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <Tabs defaultValue="foundations" className="space-y-8" onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2 flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-[var(--color-primary-default)] data-[state=active]:text-white bg-white border border-gray-200 px-4 py-2 h-auto mb-2"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="foundations">
            <UIKitFoundations />
          </TabsContent>

          <TabsContent value="elements">
            <UIKitElements />
          </TabsContent>

          <TabsContent value="forms">
            <UIKitForms />
          </TabsContent>

          <TabsContent value="complex-forms">
            <UIKitComplexForms />
          </TabsContent>

          <TabsContent value="navigation">
            <UIKitNavigation />
          </TabsContent>

          <TabsContent value="nav-patterns">
            <UIKitNavigationPatterns />
          </TabsContent>

          <TabsContent value="feedback">
            <UIKitFeedback />
          </TabsContent>

          <TabsContent value="data">
            <UIKitDataDisplay />
          </TabsContent>

          <TabsContent value="patterns">
            <UIKitPatterns />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
