import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { Icon } from '../Icon';

// Import flow and schema configurations
import { flowConfig } from '../../config/flow';
import { schemaConfig } from '../../config/schema';

interface FlowVisualizerProps {
  flowData: any;
  className?: string;
}

function FlowVisualizer({ flowData, className }: FlowVisualizerProps) {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  const flows = Object.entries(flowData.flow || {});
  const screens = Object.entries(flowData.screens || {});
  const components = flowData.components || {};

  return (
    <div className={cn("space-y-6", className)}>
      {/* Flow Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="workflow" size={20} style={{ color: 'var(--color-primary-default)' }} />
              User Flows
            </CardTitle>
            <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
              {flows.length} flows
            </Badge>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Complete user journey mapping for {flowData.name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map(([flowKey, flowValue]: [string, any]) => (
              <Card 
                key={flowKey}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedFlow === flowKey && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedFlow(selectedFlow === flowKey ? null : flowKey)}
              >
                <CardHeader className="pb-3">
                  <CardTitle 
                    style={{ 
                      fontSize: 'var(--text-base)', 
                      textTransform: 'capitalize',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {flowKey.replace(/_/g, ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.isArray(flowValue) ? (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {flowValue.length} steps
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {flowValue.slice(0, 3).map((step: string, index: number) => (
                            <Badge key={index} variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                              {step}
                            </Badge>
                          ))}
                          {flowValue.length > 3 && (
                            <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                              +{flowValue.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : typeof flowValue === 'object' ? (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {Object.keys(flowValue).length} components
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.keys(flowValue).slice(0, 2).map((key: string) => (
                            <Badge key={key} variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                              {key}
                            </Badge>
                          ))}
                          {Object.keys(flowValue).length > 2 && (
                            <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                              +{Object.keys(flowValue).length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                        {flowValue}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Flow Details */}
          {selectedFlow && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <h3 
                style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-3)',
                  textTransform: 'capitalize'
                }}
              >
                {selectedFlow.replace(/_/g, ' ')} Flow Details
              </h3>
              <pre 
                className="text-xs overflow-auto p-3 rounded"
                style={{ 
                  backgroundColor: 'var(--color-bg-card)',
                  fontFamily: 'var(--font-family-mono)',
                  maxHeight: '300px'
                }}
              >
                {JSON.stringify(flowData.flow[selectedFlow], null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screen Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="monitor" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Screen Components
          </CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Main application screens and their component mapping
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {screens.map(([screenName, screenConfig]: [string, any]) => (
              <Card key={screenName} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ fontSize: 'var(--text-base)' }}>
                      {screenName}
                    </CardTitle>
                    <Badge 
                      variant={screenConfig.auth_required ? 'default' : 'secondary'}
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {screenConfig.auth_required ? 'Protected' : 'Public'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {screenConfig.route}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {screenConfig.component && (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Main Component
                        </div>
                        <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                          {screenConfig.component}
                        </Badge>
                      </div>
                    )}

                    {screenConfig.blocks && (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          UI Blocks
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {screenConfig.blocks.map((block: string) => (
                            <Badge key={block} variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                              {block}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {screenConfig.flow && (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Flow Component
                        </div>
                        <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                          {screenConfig.flow}
                        </Badge>
                      </div>
                    )}

                    {screenConfig.features && (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Features
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {screenConfig.features.map((feature: string) => (
                            <Badge key={feature} variant="default" style={{ fontSize: 'var(--text-xs)' }}>
                              {feature.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="package" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Component System
          </CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Organized component categories and their implementations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(components).map(([category, items]: [string, any]) => (
              <div key={category}>
                <h3 
                  style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-3)',
                    textTransform: 'capitalize'
                  }}
                >
                  {category.replace(/_/g, ' ')} ({Array.isArray(items) ? items.length : 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(items) && items.map((item: string) => (
                    <Badge key={item} variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contexts & Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="settings" size={20} style={{ color: 'var(--color-primary-default)' }} />
              React Contexts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowData.contexts?.map((context: string) => (
                <div key={context} className="flex items-center gap-2">
                  <Icon name="circle" size={8} style={{ color: 'var(--color-status-success)' }} />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{context}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="zap" size={20} style={{ color: 'var(--color-primary-default)' }} />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(flowData.features || {}).map(([feature, enabled]: [string, any]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <Badge 
                    variant={enabled ? 'default' : 'secondary'}
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SchemaVisualizerProps {
  schemaData: any;
  className?: string;
}

function SchemaVisualizer({ schemaData, className }: SchemaVisualizerProps) {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const entities = Object.entries(schemaData.entities || {});
  const relationships = schemaData.relationships || {};
  const apiEndpoints = schemaData.api_endpoints || {};

  return (
    <div className={cn("space-y-6", className)}>
      {/* Schema Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="database" size={20} style={{ color: 'var(--color-primary-default)' }} />
              Data Schema
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                {entities.length} entities
              </Badge>
              <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                {schemaData.implementation}
              </Badge>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {schemaData.description} - Version {schemaData.version}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entities.map(([entityName, entityConfig]: [string, any]) => (
              <Card 
                key={entityName}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedEntity === entityName && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedEntity(selectedEntity === entityName ? null : entityName)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ fontSize: 'var(--text-base)' }}>
                      {entityName}
                    </CardTitle>
                    <Badge 
                      variant={entityConfig.storage === 'kv_store' ? 'default' : 'secondary'}
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {entityConfig.storage}
                    </Badge>
                  </div>
                  <p style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-md)'
                  }}>
                    {entityConfig.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Fields: {Object.keys(entityConfig.fields || {}).length}
                    </div>
                    {entityConfig.key_pattern && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Key: {entityConfig.key_pattern}
                      </div>
                    )}
                    {entityConfig.sample_data && (
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          Sample Data
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entityConfig.sample_data.slice(0, 2).map((sample: string) => (
                            <Badge key={sample} variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                              {sample}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Entity Details */}
          {selectedEntity && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              <h3 
                style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-3)'
                }}
              >
                {selectedEntity} Schema
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                    Fields
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(schemaData.entities[selectedEntity].fields || {}).map(([field, type]: [string, any]) => (
                      <div key={field} className="flex justify-between text-sm">
                        <span style={{ fontFamily: 'var(--font-family-mono)' }}>{field}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-2)' }}>
                    Configuration
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div>Storage: <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                      {schemaData.entities[selectedEntity].storage}
                    </Badge></div>
                    {schemaData.entities[selectedEntity].key_pattern && (
                      <div>Pattern: <code style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-bg-card)', padding: '2px 4px', borderRadius: '4px' }}>
                        {schemaData.entities[selectedEntity].key_pattern}
                      </code></div>
                    )}
                    {schemaData.entities[selectedEntity].indexes && (
                      <div>
                        Indexes: {schemaData.entities[selectedEntity].indexes.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="server" size={20} style={{ color: 'var(--color-primary-default)' }} />
            API Endpoints
          </CardTitle>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            RESTful API endpoints for data operations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(apiEndpoints).filter(([key]) => key !== 'base_url').map(([category, endpoints]: [string, any]) => (
              <div key={category}>
                <h3 
                  style={{ 
                    fontSize: 'var(--text-base)', 
                    fontWeight: 'var(--font-weight-medium)',
                    marginBottom: 'var(--spacing-2)',
                    textTransform: 'capitalize'
                  }}
                >
                  {category}
                </h3>
                <div className="space-y-2">
                  {Object.entries(endpoints).map(([endpointName, endpointPath]: [string, any]) => (
                    <div 
                      key={endpointName}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      style={{ borderColor: 'var(--color-border-default)' }}
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={endpointPath.startsWith('GET') ? 'secondary' : 
                                  endpointPath.startsWith('POST') ? 'default' : 
                                  endpointPath.startsWith('PUT') ? 'outline' : 'destructive'}
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          {endpointPath.split(' ')[0]}
                        </Badge>
                        <span style={{ fontSize: 'var(--text-sm)' }}>{endpointName.replace(/_/g, ' ')}</span>
                      </div>
                      <code 
                        style={{ 
                          fontSize: 'var(--text-xs)', 
                          fontFamily: 'var(--font-family-mono)',
                          backgroundColor: 'var(--color-bg-card)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {endpointPath.split(' ')[1]}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="gitBranch" size={20} style={{ color: 'var(--color-primary-default)' }} />
            Data Relationships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(relationships).map(([relationName, relation]: [string, any]) => (
              <div key={relationName} className="flex items-center justify-between p-2 rounded">
                <span style={{ fontSize: 'var(--text-sm)' }}>{relationName.replace(/_/g, ' ')}</span>
                <code style={{ 
                  fontSize: 'var(--text-xs)', 
                  fontFamily: 'var(--font-family-mono)',
                  color: 'var(--color-text-muted)'
                }}>
                  {relation}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="wifi" size={20} style={{ color: 'var(--color-primary-default)' }} />
              Offline Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Cached Entities
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {schemaData.offline_support?.cached_entities?.map((entity: string) => (
                    <Badge key={entity} variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  Sync Strategy
                </div>
                <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                  {schemaData.offline_support?.sync_strategy}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="shield" size={20} style={{ color: 'var(--color-primary-default)' }} />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(schemaData.security || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span style={{ fontSize: 'var(--text-sm)' }}>{key.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                    {value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FlowSchemaShowcase() {
  return (
    <div className="min-h-screen p-4 space-y-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-8">
          <h1 
            style={{ 
              fontSize: 'var(--text-3xl)', 
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}
          >
            iKan Flow & Schema Documentation
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete application architecture, user flows, and data schema documentation
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="w-fit">Flow v{flowConfig.version}</Badge>
            <Badge variant="secondary" className="w-fit">Schema v{schemaConfig.version}</Badge>
            <Badge variant="outline" className="w-fit">Mental Health PWA</Badge>
          </div>
        </div>

        <Tabs defaultValue="flows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flows">User Flows & Components</TabsTrigger>
            <TabsTrigger value="schema">Data Schema & API</TabsTrigger>
          </TabsList>

          <TabsContent value="flows" className="space-y-6">
            <FlowVisualizer flowData={flowConfig} />
          </TabsContent>

          <TabsContent value="schema" className="space-y-6">
            <SchemaVisualizer schemaData={schemaConfig} />
          </TabsContent>
        </Tabs>

        {/* Implementation Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Architecture Highlights
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• React 18 with TypeScript</li>
                  <li>• Context-based state management</li>
                  <li>• Supabase KV store backend</li>
                  <li>• PWA with offline support</li>
                  <li>• Responsive design system</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Key Features
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Mental health assessments</li>
                  <li>• Mood tracking & journaling</li>
                  <li>• Equip program purchases</li>
                  <li>• Razorpay payment integration</li>
                  <li>• Professional consultation directory</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Technical Implementation
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Component-based architecture</li>
                  <li>• JSON-driven configuration</li>
                  <li>• Design token system</li>
                  <li>• Accessibility compliant</li>
                  <li>• Production-ready codebase</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Development Status
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Completed:</strong> All core features implemented with comprehensive component system</p>
                  <p><strong>Testing:</strong> Manual testing completed, automated tests pending</p>
                </div>
                <div>
                  <p><strong>Deployment:</strong> Ready for staging environment deployment</p>  
                  <p><strong>Monitoring:</strong> Error tracking and analytics integration ready</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                This documentation reflects the current implementation of the iKan mental health PWA, 
                including all user flows, component architecture, data schema, and API endpoints. 
                The application is built with accessibility, performance, and mental health UX best practices in mind.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}