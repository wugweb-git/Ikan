import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RichTextEditor } from '../ui/rich-text-editor';
import { 
  Heart, Star, ThumbsUp, ThumbsDown, Smile, Frown, Meh, 
  CheckCircle, XCircle, Clock, Activity, Sun, Moon,
  CheckSquare, X as XIcon, ExternalLink
} from 'lucide-react';

export function AdminUIKitShowcase() {
  const [selectedMCQ, setSelectedMCQ] = useState<string[]>([]);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<string>('');
  const [selectedIconMCQ, setSelectedIconMCQ] = useState<string>('');
  const [scaleValue, setScaleValue] = useState<number>(5);
  const [dropdownValue, setDropdownValue] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [richTextAnswer, setRichTextAnswer] = useState<string>('');
  const [timerValue, setTimerValue] = useState<number>(60);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 
            style={{
              fontSize: '28px',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-base)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-2)'
            }}
          >
            UI Kit Showcase
          </h2>
          <p 
            style={{
              fontSize: '15px',
              fontFamily: 'var(--font-family-base)',
              fontWeight: 'var(--font-weight-regular)',
              color: 'var(--color-text-muted)'
            }}
          >
            Interactive catalog of UI components and assessment question types.
          </p>
        </div>
        
        {/* Link to Full UI Kit */}
        <Button
          onClick={() => window.open('/ui-kit', '_blank')}
          className="gap-2"
          style={{
            backgroundColor: 'var(--color-primary-default)',
            color: 'var(--color-primary-on)'
          }}
        >
          <ExternalLink className="w-4 h-4" />
          Full UI Kit (50+ Components)
        </Button>
      </div>

      {/* Core Components Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
             </div>
             <div className="flex flex-wrap gap-2 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" variant="outline"><Star className="w-4 h-4" /></Button>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Badges & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
             </div>
             <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-semibold mt-8 border-b pb-2">Assessment Question Types</h3>
        {/* 1. Multiple Choice Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  1. Multiple Choice Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Traditional MCQ with single or multiple selections
                </p>
              </div>
              <Badge variant="default" style={{ backgroundColor: '#3B82F6', color: 'white' }}>MCQ</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  How would you rate your current stress level?
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                  Select all that apply
                </p>
              </div>
              <div className="space-y-3">
                {['Very Low - I feel calm and relaxed', 'Low - Minimal stress', 'Moderate - Some pressure but manageable', 'High - Feeling overwhelmed', 'Very High - Severe stress'].map((option, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: selectedMCQ.includes(option) ? '#3B82F6' : '#E5E7EB',
                      backgroundColor: selectedMCQ.includes(option) ? '#EFF6FF' : 'white'
                    }}
                    onClick={() => {
                      if (selectedMCQ.includes(option)) {
                        setSelectedMCQ(selectedMCQ.filter(o => o !== option));
                      } else {
                        setSelectedMCQ([...selectedMCQ, option]);
                      }
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: `2px solid ${selectedMCQ.includes(option) ? '#3B82F6' : '#E5E7EB'}`,
                        backgroundColor: selectedMCQ.includes(option) ? '#3B82F6' : 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: selectedMCQ.includes(option) ? 'white' : '#9CA3AF'
                      }}
                    >
                      {selectedMCQ.includes(option) ? '✓' : String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-regular)' }}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. True/False Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  2. True/False Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Binary choice question
                </p>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: '#10B981', color: 'white' }}>True/False</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  I often feel anxious in social situations
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-6 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all text-center"
                  style={{
                    borderColor: selectedTrueFalse === 'true' ? '#10B981' : '#E5E7EB',
                    backgroundColor: selectedTrueFalse === 'true' ? '#D1FAE5' : 'white'
                  }}
                  onClick={() => setSelectedTrueFalse('true')}
                >
                  <CheckSquare 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: selectedTrueFalse === 'true' ? '#10B981' : '#9CA3AF' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
                    True
                  </span>
                </div>
                <div
                  className="p-6 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all text-center"
                  style={{
                    borderColor: selectedTrueFalse === 'false' ? '#EF4444' : '#E5E7EB',
                    backgroundColor: selectedTrueFalse === 'false' ? '#FEE2E2' : 'white'
                  }}
                  onClick={() => setSelectedTrueFalse('false')}
                >
                  <XIcon 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: selectedTrueFalse === 'false' ? '#EF4444' : '#9CA3AF' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: 'var(--font-weight-medium)' }}>
                    False
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. MCQ with Icons */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  3. MCQ with Icons
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Multiple choice with visual icon indicators
                </p>
              </div>
              <Badge style={{ backgroundColor: '#8B5CF6', color: 'white' }}>Icons</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  How do you feel right now?
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Smile, label: 'Happy', color: '#10B981', value: 'happy' },
                  { icon: Meh, label: 'Neutral', color: '#F59E0B', value: 'neutral' },
                  { icon: Frown, label: 'Sad', color: '#EF4444', value: 'sad' }
                ].map((option) => (
                  <div
                    key={option.value}
                    className="p-6 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all text-center"
                    style={{
                      borderColor: selectedIconMCQ === option.value ? option.color : '#E5E7EB',
                      backgroundColor: selectedIconMCQ === option.value ? `${option.color}20` : 'white'
                    }}
                    onClick={() => setSelectedIconMCQ(option.value)}
                  >
                    <option.icon 
                      className="w-10 h-10 mx-auto mb-3" 
                      style={{ color: selectedIconMCQ === option.value ? option.color : '#9CA3AF' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Scale Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  4. Scale Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Numeric rating scale with labels
                </p>
              </div>
              <Badge variant="outline" style={{ borderColor: '#F59E0B', color: '#F59E0B' }}>Scale</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  On a scale of 1-10, how would you rate your overall mental well-being today?
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                  1 = Very Poor, 10 = Excellent
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div
                      key={num}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => setScaleValue(num)}
                    >
                      <div
                        className="flex items-center justify-center transition-all"
                        style={{
                          width: scaleValue === num ? '44px' : '36px',
                          height: scaleValue === num ? '44px' : '36px',
                          borderRadius: '50%',
                          backgroundColor: scaleValue === num ? '#3B82F6' : '#F3F4F6',
                          color: scaleValue === num ? 'white' : '#6B7280',
                          fontSize: scaleValue === num ? '16px' : '14px',
                          fontWeight: 'var(--font-weight-medium)',
                          border: scaleValue === num ? '2px solid #3B82F6' : 'none'
                        }}
                      >
                        {num}
                      </div>
                      {(num === 1 || num === 10) && (
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            color: '#9CA3AF', 
                            marginTop: '6px',
                            fontWeight: 'var(--font-weight-regular)'
                          }}
                        >
                          {num === 1 ? 'Poor' : 'Excellent'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <div 
                    className="h-2 rounded-full relative"
                    style={{ backgroundColor: '#E5E7EB' }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(scaleValue / 10) * 100}%`,
                        backgroundColor: '#3B82F6'
                      }}
                    />
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                  <p style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 'var(--font-weight-medium)' }}>
                    Selected: {scaleValue}/10
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Dropdown Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  5. Dropdown Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Select from dropdown list
                </p>
              </div>
              <Badge variant="secondary" style={{ backgroundColor: '#6B7280', color: 'white' }}>Dropdown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  What is your primary reason for seeking mental health support?
                </h3>
              </div>
              <Select value={dropdownValue} onValueChange={setDropdownValue}>
                <SelectTrigger 
                  style={{
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                >
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anxiety">Anxiety and worry</SelectItem>
                  <SelectItem value="depression">Depression and low mood</SelectItem>
                  <SelectItem value="stress">Stress management</SelectItem>
                  <SelectItem value="relationships">Relationship issues</SelectItem>
                  <SelectItem value="trauma">Trauma or PTSD</SelectItem>
                  <SelectItem value="sleep">Sleep problems</SelectItem>
                  <SelectItem value="general">General wellness</SelectItem>
                  <SelectItem value="other">Other concerns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 6. Text Answer Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  6. Text Answer Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Free-form text input with character limit
                </p>
              </div>
              <Badge variant="outline" style={{ borderColor: '#6B7280', color: '#6B7280' }}>Text</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  Describe a recent situation that caused you stress
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                  Please provide as much detail as you're comfortable sharing
                </p>
              </div>
              <div className="space-y-2">
                <Textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[120px]"
                  maxLength={500}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px'
                  }}
                />
                <div className="flex justify-between items-center">
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Optional: Share your thoughts and feelings
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>
                    {textAnswer.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Rich Text Answer Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  7. Rich Text Answer Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Formatted text with bold, italic, lists, and more
                </p>
              </div>
              <Badge style={{ backgroundColor: '#EC4899', color: 'white' }}>Rich Text</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  What are your mental health goals for the next 3 months?
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
                  Use formatting to organize your thoughts (bullets, numbering, etc.)
                </p>
              </div>
              <RichTextEditor
                value={richTextAnswer}
                onChange={setRichTextAnswer}
                placeholder="• Goal 1: Improve sleep quality&#10;• Goal 2: Reduce anxiety&#10;• Goal 3: Build healthy routines"
                minHeight="200px"
              />
            </div>
          </CardContent>
        </Card>

        {/* 8. Timed Question */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1.5px solid #E5E7EB' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', marginBottom: '4px' }}>
                  8. Timed Question
                </CardTitle>
                <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'var(--font-weight-regular)' }}>
                  Question with countdown timer
                </p>
              </div>
              <Badge variant="destructive" style={{ backgroundColor: '#F59E0B', color: 'white' }}>Timed</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: '#9A3412' }}>
                      Time Remaining
                    </p>
                    <p style={{ fontSize: '12px', color: '#9A3412' }}>
                      Question will auto-submit when time expires
                    </p>
                  </div>
                </div>
                <div 
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: '#F59E0B', color: 'white' }}
                >
                  <span style={{ fontSize: '24px', fontWeight: 'var(--font-weight-medium)' }}>
                    {Math.floor(timerValue / 60)}:{(timerValue % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-weight-medium)', marginBottom: '12px' }}>
                  Quick response: What is the first word that comes to mind when you think about your mental health?
                </h3>
              </div>

              <Input
                placeholder="Type your first thought..."
                style={{
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  borderColor: '#F59E0B'
                }}
              />

              <div className="pt-2">
                <div 
                  className="h-2 rounded-full relative"
                  style={{ backgroundColor: '#FED7AA' }}
                >
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(timerValue / 60) * 100}%`,
                      backgroundColor: '#F59E0B'
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '2px solid #3B82F6', backgroundColor: '#EFF6FF' }}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-weight-medium)', color: '#1E40AF' }}>
                ✨ All Question Types Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { type: 'Multiple Choice', icon: '☑️', desc: 'Single or multiple selections' },
                  { type: 'True/False', icon: '✓✗', desc: 'Binary yes/no questions' },
                  { type: 'MCQ with Icons', icon: '😊', desc: 'Visual icon-based choices' },
                  { type: 'Scale', icon: '📊', desc: 'Numeric rating (1-10)' },
                  { type: 'Dropdown', icon: '▼', desc: 'Select from dropdown' },
                  { type: 'Text Answer', icon: '✍️', desc: 'Free-form text input' },
                  { type: 'Rich Text', icon: '📝', desc: 'Formatted text editor' },
                  { type: 'Timed Question', icon: '⏱️', desc: 'Time-limited responses' }
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'white', border: '1px solid #BFDBFE' }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)', color: '#1E40AF' }}>
                          {item.type}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6B7280' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}