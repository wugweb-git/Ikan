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

export function UIKitShowcase({ onNavigate }: { onNavigate?: (route: string) => void }) {
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
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      {/* Custom Header for Full Screen Mode */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div>
           <h1 className="text-xl font-bold text-[var(--color-text-primary)]">iKan Design System</h1>
           <p className="text-sm text-[var(--color-text-muted)]">UI Kit & Component Library</p>
        </div>
        <button 
          onClick={() => onNavigate?.('/dashboard')}
          className="text-sm font-medium text-[var(--color-primary-default)] hover:underline"
        >
          Exit UI Kit
        </button>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-6">
        <Tabs defaultValue="foundations" className="space-y-6" onValueChange={setActiveTab}>
          <div className="sticky top-[72px] z-40 bg-[var(--color-bg-page)] pb-4 -mx-2 px-2 overflow-x-auto">
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-2 flex-wrap sm:flex-nowrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-[var(--color-primary-default)] data-[state=active]:text-white bg-white border border-gray-200 px-4 py-2.5 h-auto rounded-full shadow-sm whitespace-nowrap"
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="foundations" className="m-0 focus-visible:outline-none">
              <UIKitFoundations />
            </TabsContent>

            <TabsContent value="elements" className="m-0 focus-visible:outline-none">
              <UIKitElements />
            </TabsContent>

            <TabsContent value="forms" className="m-0 focus-visible:outline-none">
              <UIKitForms />
            </TabsContent>

            <TabsContent value="complex-forms" className="m-0 focus-visible:outline-none">
              <UIKitComplexForms />
            </TabsContent>

            <TabsContent value="navigation" className="m-0 focus-visible:outline-none">
              <UIKitNavigation />
            </TabsContent>

            <TabsContent value="nav-patterns" className="m-0 focus-visible:outline-none">
              <UIKitNavigationPatterns />
            </TabsContent>

            <TabsContent value="feedback" className="m-0 focus-visible:outline-none">
              <UIKitFeedback />
            </TabsContent>

            <TabsContent value="data" className="m-0 focus-visible:outline-none">
              <UIKitDataDisplay />
            </TabsContent>

            <TabsContent value="patterns" className="m-0 focus-visible:outline-none">
              <UIKitPatterns />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
