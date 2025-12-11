import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

// Navigation Components
import { TopNavBar } from './navigation/TopNavBar';
import { BottomNavBarMobile } from './navigation/BottomNavBarMobile';
import { SearchBar } from './navigation/SearchBar';

// Button Components
import { ButtonPrimary } from './buttons/ButtonPrimary';
import { ButtonSecondary } from './buttons/ButtonSecondary';
import { ButtonDestructive } from './buttons/ButtonDestructive';
import { ButtonGhost } from './buttons/ButtonGhost';
import { ButtonIcon } from './buttons/ButtonIcon';
import { ButtonLink } from './buttons/ButtonLink';

// Input Components
import { TextInput } from './inputs/TextInput';
import { TextArea } from './inputs/TextArea';
import { RatingStars } from './inputs/RatingStars';

import { cn } from './ui/utils';

export function ComponentShowcase() {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [searchValue, setSearchValue] = useState('');
  const [rating, setRating] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [textAreaValue, setTextAreaValue] = useState('');

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
            iKan Component Showcase
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>
            Complete implementation of the iKan design system components with design tokens, animations, and interactions.
          </p>
          <Badge variant="secondary" className="w-fit">
            Components JSON Implementation
          </Badge>
        </div>

        <Tabs defaultValue="navigation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
          </TabsList>

          {/* Navigation Components */}
          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Components</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Enhanced navigation with tokens, states, icons, interactions, constraints, and animations.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* TopNavBar */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    TopNavBar (Desktop)
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <TopNavBar 
                      currentRoute={currentRoute}
                      onNavigate={setCurrentRoute}
                    />
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Scroll animations, hover effects, active states, responsive design</p>
                    <p><strong>Tokens:</strong> navbar.default, spacing.3, type.title, zIndex.overlay</p>
                    <p><strong>Animations:</strong> slideDown, fadeIn, hover transforms</p>
                  </div>
                </div>

                <Separator />

                {/* SearchBar */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    SearchBar
                  </h3>
                  <div className="max-w-md">
                    <SearchBar 
                      placeholder="Search components..."
                      value={searchValue}
                      onChange={setSearchValue}
                      onSearch={(value) => console.log('Searching:', value)}
                    />
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Focus states, icon animations, scaleIn animation</p>
                    <p><strong>Tokens:</strong> input.background, borders.radius.md, icons.sizes.md</p>
                    <p><strong>States:</strong> default, focus, empty</p>
                  </div>
                </div>

                <Separator />

                {/* BottomNavBarMobile */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    BottomNavBarMobile
                  </h3>
                  <div className="relative bg-gray-100 rounded-lg p-4" style={{ minHeight: '120px' }}>
                    <div className="absolute bottom-0 left-0 right-0">
                      <BottomNavBarMobile 
                        currentRoute={currentRoute}
                        onNavigate={setCurrentRoute}
                        className="relative"
                      />
                    </div>
                  </div>
                  <div className="text-sm space-y-2" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Touch-optimized, active indicators, slideUp animation</p>
                    <p><strong>Tokens:</strong> bg.canvas, primary.default, borders.radius.lg</p>
                    <p><strong>Interactions:</strong> tap, touch feedback, scale animations</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Button Components */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Components</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Complete button system with ripple effects, hover animations, and accessibility features.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Button Variants */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Button Variants
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <ButtonPrimary leadingIcon="checkCircle">
                      Primary Button
                    </ButtonPrimary>
                    <ButtonSecondary trailingIcon="arrowRight">
                      Secondary Button
                    </ButtonSecondary>
                    <ButtonDestructive>
                      Delete Action
                    </ButtonDestructive>
                    <ButtonGhost leadingIcon="more">
                      Ghost Button
                    </ButtonGhost>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Ripple effects, hover transforms, loading states, icon support</p>
                  </div>
                </div>

                <Separator />

                {/* Button Sizes */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Button Sizes
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <ButtonPrimary size="sm">Small</ButtonPrimary>
                    <ButtonPrimary size="md">Medium</ButtonPrimary>
                    <ButtonPrimary size="lg">Large</ButtonPrimary>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Touch Targets:</strong> All buttons maintain 44px minimum height for accessibility</p>
                  </div>
                </div>

                <Separator />

                {/* Icon Buttons */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Icon Buttons
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <ButtonIcon icon="heart" aria-label="Like" />
                    <ButtonIcon icon="heart" selected aria-label="Liked" />
                    <ButtonIcon icon="more" variant="ghost" aria-label="More options" />
                    <ButtonIcon icon="settings" variant="solid" selected aria-label="Settings" />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Bounce animation on click, scale hover effects, proper ARIA labels</p>
                  </div>
                </div>

                <Separator />

                {/* Link Buttons */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Link Buttons
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <ButtonLink>Learn More</ButtonLink>
                    <ButtonLink href="#" external>
                      External Link
                    </ButtonLink>
                    <ButtonLink trailingIcon="arrowRight">
                      Continue Reading
                    </ButtonLink>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Underline animations, icon transforms, external link handling</p>
                  </div>
                </div>

                {/* Button States */}
                <Separator />
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Button States
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <ButtonPrimary>Normal</ButtonPrimary>
                    <ButtonPrimary loading>Loading</ButtonPrimary>
                    <ButtonPrimary disabled>Disabled</ButtonPrimary>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>States:</strong> default, hover, active, disabled, loading with proper visual feedback</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Input Components */}
          <TabsContent value="inputs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Components</CardTitle>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Form inputs with validation states, animations, and enhanced accessibility.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {/* Text Input */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Text Input
                  </h3>
                  <div className="max-w-md space-y-4">
                    <TextInput 
                      label="Email Address"
                      placeholder="Enter your email"
                      leadingIcon="search"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                    />
                    <TextInput 
                      label="Password"
                      type="password"
                      trailingIcon="eye"
                      error="Password must be at least 8 characters"
                    />
                    <TextInput 
                      label="Read Only"
                      value="This field is read-only"
                      readOnly
                    />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Focus rings, icon support, error states, scaleIn animation</p>
                    <p><strong>States:</strong> default, focus, error, disabled, readOnly</p>
                  </div>
                </div>

                <Separator />

                {/* Text Area */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Text Area
                  </h3>
                  <div className="max-w-md">
                    <TextArea 
                      label="Message"
                      placeholder="Write your message here..."
                      value={textAreaValue}
                      onChange={(e) => setTextAreaValue(e.target.value)}
                      helperText="Maximum 500 characters"
                      minRows={4}
                      maxRows={8}
                    />
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Resizable, row constraints, article icon indicator</p>
                    <p><strong>Tokens:</strong> input.background, borders.radius.md, type.body</p>
                  </div>
                </div>

                <Separator />

                {/* Rating Stars */}
                <div className="space-y-4">
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Rating Stars
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        Rate your experience:
                      </label>
                      <RatingStars 
                        value={rating}
                        onChange={setRating}
                        size="md"
                      />
                    </div>
                    <div>
                      <label style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        Read-only rating:
                      </label>
                      <RatingStars 
                        value={4.5}
                        readonly
                        allowHalf
                        size="lg"
                      />
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <p><strong>Features:</strong> Hover effects, bounce animation, half-star support, accessibility</p>
                    <p><strong>Interactions:</strong> click, hover with visual feedback</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Design Token Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Design Tokens Used
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• Primary & accent colors</li>
                  <li>• Spacing scale (4px grid)</li>
                  <li>• Border radius variants</li>
                  <li>• Typography scale</li>
                  <li>• Z-index layers</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Animations & Motion
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• fadeIn, slideUp, slideDown</li>
                  <li>• scaleIn, bounce effects</li>
                  <li>• Ripple interactions</li>
                  <li>• Hover transforms</li>
                  <li>• Focus animations</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '8px' }}>
                  Accessibility Features
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <li>• 44px touch targets</li>
                  <li>• ARIA labels</li>
                  <li>• Keyboard navigation</li>
                  <li>• Focus indicators</li>
                  <li>• Screen reader support</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                All components follow the iKan design system specifications with proper token usage, 
                state management, interactions, constraints, and animations as defined in the components JSON.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}