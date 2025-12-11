import React from 'react';
import { 
  BlockRenderer,
  TopSectionUserPersonalized,
  ResourceGridBlock,
  AccountDetailsSection,
  UserLoginBlock,
  EquipCalendarBlock,
  ConsultationDirectoryBlock,
  MoodJournalMonthBlock,
  AssessmentFlowBlock,
  SupportChatBlock,
  ResourceListBlock
} from './BlockRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { uiBlocksConfig, type BlockName } from '../../lib/ui-blocks';

interface BlockShowcaseProps {
  className?: string;
  showCode?: boolean;
}

export function BlockShowcase({ className, showCode = false }: BlockShowcaseProps) {
  const blockComponents = {
    TopSectionUserPersonalized,
    ResourceGridBlock,
    AccountDetailsSection,
    UserLoginBlock,
    EquipCalendarBlock,
    ConsultationDirectoryBlock,
    MoodJournalMonthBlock,
    AssessmentFlowBlock,
    SupportChatBlock,
    ResourceListBlock
  };

  const blockNames = Object.keys(uiBlocksConfig.blocks) as BlockName[];

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-2">
        <h2>iKan UI Blocks System</h2>
        <p className="text-muted-foreground">
          Pre-built UI blocks with responsive layouts and design token integration
        </p>
      </div>

      <Tabs defaultValue="showcase" className="w-full">
        <TabsList>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
          <TabsTrigger value="individual">Individual Blocks</TabsTrigger>
          {showCode && <TabsTrigger value="configuration">Configuration</TabsTrigger>}
        </TabsList>

        <TabsContent value="showcase" className="space-y-8">
          <div className="space-y-6">
            <h3>Sample Application Layout</h3>
            
            {/* Top Section */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Dashboard Overview</h4>
              <TopSectionUserPersonalized />
            </section>

            <Separator />

            {/* Main Content Grid */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Resources</h4>
              <ResourceGridBlock />
            </section>

            <Separator />

            {/* Calendar Section */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Mood Tracking</h4>
              <EquipCalendarBlock />
            </section>

            <Separator />

            {/* Support Section */}
            <section className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Support & Assessment</h4>
              <div className="grid gap-6 lg:grid-cols-2">
                <AssessmentFlowBlock />
                <SupportChatBlock />
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          {blockNames.map((blockName) => {
            const BlockComponent = blockComponents[blockName as keyof typeof blockComponents];
            const blockConfig = uiBlocksConfig.blocks[blockName];
            
            return (
              <Card key={blockName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{blockName}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {blockConfig.layout?.type || blockConfig.grid ? 'grid' : 'layout'}
                      </Badge>
                      {blockConfig.interactions && blockConfig.interactions.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Interactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  {blockConfig.interactions && blockConfig.interactions.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Interactions: {blockConfig.interactions.join(', ')}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <BlockComponent />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {showCode && (
          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Block Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                  {JSON.stringify(uiBlocksConfig, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

interface BlockDemoProps {
  blockName: BlockName;
  className?: string;
}

export function BlockDemo({ blockName, className }: BlockDemoProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="font-medium">{blockName}</h3>
        <p className="text-sm text-muted-foreground">
          Block demonstration with live components
        </p>
      </div>
      <BlockRenderer blockName={blockName} />
    </div>
  );
}

export default BlockShowcase;