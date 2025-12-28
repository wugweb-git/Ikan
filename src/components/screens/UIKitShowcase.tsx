import React, { useState } from 'react';
import { 
  Palette, Type, Image as ImageIcon, Layout, Heart, Brain, 
  Activity, MessageCircle, TrendingUp, Bell, Settings, 
  Smile, Frown, Meh, ThumbsUp, Calendar, Clock, Sliders,
  CheckSquare, Radio, Mic, ChevronDown, Play, Pause, LifeBuoy,
  BarChart3, PieChart, LineChart, Target, Award, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ShowcaseSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sections: ShowcaseSection[] = [
  {
    id: 'data-input',
    title: '1. Data Input & Emotional Tracking',
    description: 'Mood sliders, emotion pickers, and low-friction journaling components',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'navigation',
    title: '2. Engagement & Navigation',
    description: 'Bottom tabs, action buttons, and progress indicators',
    icon: <Layout className="w-5 h-5" />
  },
  {
    id: 'visualization',
    title: '3. Information & Insight Feedback',
    description: 'Charts, cards, and data visualization components',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'therapy',
    title: '4. Therapy & Support Components',
    description: 'Chat interfaces, audio/video players, crisis support',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'personalization',
    title: '5. Personalization & Profile',
    description: 'User preferences, privacy controls, theme settings',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 'emotional-design',
    title: '6. Emotional Design & Accessibility',
    description: 'Illustrations, empty states, loading animations',
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: 'editing',
    title: '7. Content Editing Tools',
    description: 'Color picker, font selector, icon upload, background image editor',
    icon: <Palette className="w-5 h-5" />
  }
];

export function UIKitShowcase() {
  const [activeSection, setActiveSection] = useState('data-input');
  const [moodValue, setMoodValue] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalText, setJournalText] = useState('');
  
  // Editing state
  const [editingColor, setEditingColor] = useState('#2A2A2A');
  const [editingFontSize, setEditingFontSize] = useState('16');
  const [editingBgImage, setEditingBgImage] = useState('');

  const emotions = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😢', label: 'Sad', value: 'sad' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '😡', label: 'Angry', value: 'angry' },
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '🤗', label: 'Loved', value: 'loved' },
    { emoji: '😖', label: 'Stressed', value: 'stressed' }
  ];

  const toggleEmotion = (value: string) => {
    setSelectedEmotions(prev =>
      prev.includes(value)
        ? prev.filter(e => e !== value)
        : [...prev, value]
    );
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: 'var(--color-bg-page)',
        padding: 'var(--spacing-6)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            iKan UI Kit Showcase
          </h1>
          <p 
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-base)'
            }}
          >
            Comprehensive mental health PWA component library with emotional design at its core
          </p>
        </div>

        {/* Section Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="text-left p-4 rounded-lg transition-all"
                  style={{
                    backgroundColor: activeSection === section.id 
                      ? 'var(--color-primary-default)' 
                      : 'var(--color-bg-muted)',
                    color: activeSection === section.id 
                      ? 'var(--color-primary-on)' 
                      : 'var(--color-text-primary)',
                    border: activeSection === section.id 
                      ? '2px solid var(--color-primary-default)' 
                      : '2px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {section.icon}
                    <h3 
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-base)'
                      }}
                    >
                      {section.title}
                    </h3>
                  </div>
                  <p 
                    style={{
                      fontSize: 'var(--text-xs)',
                      opacity: 0.8
                    }}
                  >
                    {section.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Data Input & Emotional Tracking */}
        {activeSection === 'data-input' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-base)'
              }}
            >
              1. Data Input & Emotional Tracking Components
            </h2>

            {/* Mood Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Sliders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Linear Slider (1-10) */}
                <div className="space-y-3">
                  <Label>How are you feeling? (1-10)</Label>
                  <div className="flex items-center gap-4">
                    <span 
                      style={{ 
                        fontSize: 'var(--text-xl)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-primary-default)'
                      }}
                    >
                      {moodValue}
                    </span>
                    <Slider
                      value={[moodValue]}
                      onValueChange={(value) => setMoodValue(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Neutral</span>
                    <span>Very High</span>
                  </div>
                </div>

                {/* Color Gradient Slider */}
                <div className="space-y-3">
                  <Label>Energy Level</Label>
                  <div 
                    className="h-2 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #EF4444, #F59E0B, #10B981)'
                    }}
                  />
                  <Slider
                    defaultValue={[5]}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Discrete Scale with Emojis */}
                <div className="space-y-3">
                  <Label>Overall Mood</Label>
                  <div className="flex justify-between">
                    {[
                      { emoji: '😢', label: 'Very Sad' },
                      { emoji: '😕', label: 'Sad' },
                      { emoji: '😐', label: 'Neutral' },
                      { emoji: '🙂', label: 'Good' },
                      { emoji: '😊', label: 'Great' }
                    ].map((mood, idx) => (
                      <button
                        key={idx}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{
                          backgroundColor: moodValue === idx + 1 ? 'var(--color-accent-default)' : 'transparent'
                        }}
                        onClick={() => setMoodValue(idx + 1)}
                      >
                        <span style={{ fontSize: '32px' }}>{mood.emoji}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {mood.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Pickers */}
            <Card>
              <CardHeader>
                <CardTitle>Emotion Pickers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Multi-Select Emotions */}
                <div className="space-y-3">
                  <Label>What emotions are you experiencing? (Select all that apply)</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {emotions.map(emotion => (
                      <button
                        key={emotion.value}
                        onClick={() => toggleEmotion(emotion.value)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: selectedEmotions.includes(emotion.value)
                            ? 'var(--color-primary-default)'
                            : 'var(--color-bg-muted)',
                          color: selectedEmotions.includes(emotion.value)
                            ? 'var(--color-primary-on)'
                            : 'var(--color-text-primary)',
                          border: selectedEmotions.includes(emotion.value)
                            ? '2px solid var(--color-primary-default)'
                            : '2px solid transparent'
                        }}
                      >
                        <span style={{ fontSize: '40px' }}>{emotion.emoji}</span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          {emotion.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedEmotions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedEmotions.map(emotion => (
                        <Badge key={emotion} variant="default">
                          {emotions.find(e => e.value === emotion)?.label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Single-Select Current Mood */}
                <div className="space-y-3">
                  <Label>Primary Emotion</Label>
                  <div className="flex gap-2">
                    {emotions.slice(0, 4).map(emotion => (
                      <button
                        key={emotion.value}
                        className="flex-1 p-4 rounded-lg transition-all hover:scale-105"
                        style={{
                          backgroundColor: 'var(--color-bg-muted)',
                          border: '2px solid var(--color-border-default)'
                        }}
                      >
                        <div style={{ fontSize: '36px', textAlign: 'center' }}>{emotion.emoji}</div>
                        <div 
                          style={{ 
                            fontSize: 'var(--text-xs)', 
                            textAlign: 'center',
                            color: 'var(--color-text-muted)',
                            marginTop: 'var(--spacing-2)'
                          }}
                        >
                          {emotion.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Input / Journaling */}
            <Card>
              <CardHeader>
                <CardTitle>Journaling & Text Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Free-form Journaling */}
                <div className="space-y-3">
                  <Label>How was your day?</Label>
                  <Textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Start writing your thoughts... Your entries are private and secure."
                    className="min-h-[120px]"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      border: '1.5px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-lg)',
                      fontFamily: 'var(--font-family-base)'
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {journalText.length} characters
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mic className="w-4 h-4 mr-2" />
                        Voice Note
                      </Button>
                      <Button size="sm">Auto-Save</Button>
                    </div>
                  </div>
                </div>

                {/* Prompt-based Journaling */}
                <div className="space-y-3">
                  <div 
                    className="p-4 rounded-lg" 
                    style={{ 
                      backgroundColor: 'var(--color-accent-default)',
                      border: '1px solid var(--color-border-default)'
                    }}
                  >
                    <p 
                      style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--spacing-2)'
                      }}
                    >
                      💭 Today's Reflection Prompt:
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      "What's one thing you're grateful for today, and why does it matter to you?"
                    </p>
                  </div>
                  <Textarea
                    placeholder="Your response..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Checkboxes & Assessment Forms */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Checklists (PHQ-9, GAD-7 Style)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  'Little interest or pleasure in doing things',
                  'Feeling down, depressed, or hopeless',
                  'Trouble falling or staying asleep',
                  'Feeling tired or having little energy'
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  >
                    <div className="flex-1">
                      <Label className="cursor-pointer">{item}</Label>
                    </div>
                    <div className="flex gap-2">
                      {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((option, i) => (
                        <button
                          key={i}
                          className="px-3 py-2 rounded-lg text-xs transition-colors"
                          style={{
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border-default)'
                          }}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Icon-based Selectors */}
            <Card>
              <CardHeader>
                <CardTitle>Icon-based Activity Selectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>What activities did you do today?</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { icon: <Activity className="w-6 h-6" />, label: 'Exercise' },
                      { icon: <Heart className="w-6 h-6" />, label: 'Meditation' },
                      { icon: <MessageCircle className="w-6 h-6" />, label: 'Therapy' },
                      { icon: <Smile className="w-6 h-6" />, label: 'Social' },
                      { icon: <Brain className="w-6 h-6" />, label: 'Learning' },
                      { icon: <Calendar className="w-6 h-6" />, label: 'Planning' }
                    ].map((activity, idx) => (
                      <button
                        key={idx}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                        style={{
                          backgroundColor: 'var(--color-bg-muted)',
                          border: '2px solid var(--color-border-default)'
                        }}
                      >
                        {activity.icon}
                        <span style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
                          {activity.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 2: Navigation & Engagement */}
        {activeSection === 'navigation' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              2. Engagement, Navigation & Habit Formation
            </h2>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Action Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Actions */}
                <div className="space-y-3">
                  <Label>Primary Actions (High Emphasis)</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <Heart className="w-4 h-4 mr-2" />
                      Start Session
                    </Button>
                    <Button>
                      <Activity className="w-4 h-4 mr-2" />
                      Log Mood
                    </Button>
                    <Button>
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Check In
                    </Button>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="space-y-3">
                  <Label>Secondary Actions (Medium Emphasis)</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Remind Me Later
                    </Button>
                    <Button variant="outline">Skip</Button>
                  </div>
                </div>

                {/* Tertiary Actions */}
                <div className="space-y-3">
                  <Label>Tertiary/Ghost Actions (Low Pressure)</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="ghost">Learn More</Button>
                    <Button variant="ghost">Maybe Later</Button>
                  </div>
                </div>

                {/* Floating Action Button */}
                <div className="space-y-3">
                  <Label>Floating Action Button</Label>
                  <div className="relative h-32" style={{ backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)' }}>
                    <button
                      className="absolute bottom-4 right-4 rounded-full shadow-lg transition-transform hover:scale-110"
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: 'var(--color-primary-default)',
                        color: 'var(--color-primary-on)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress & Streaks */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Indicators & Streaks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Session Completion</Label>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      7 of 10 days
                    </span>
                  </div>
                  <Progress value={70} />
                </div>

                {/* Gentle Streak Indicator */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--color-accent-default)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" style={{ color: 'var(--color-warning-default)' }} />
                    <div className="flex-1">
                      <p 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-text-primary)'
                        }}
                      >
                        5 day streak
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        You're building consistency 🎉
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completion Badges */}
                <div className="space-y-3">
                  <Label>Milestone Badges</Label>
                  <div className="flex gap-3">
                    <div 
                      className="flex flex-col items-center gap-2 p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <Award className="w-8 h-8" style={{ color: 'var(--color-success-default)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
                        First Week
                      </span>
                    </div>
                    <div 
                      className="flex flex-col items-center gap-2 p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <Target className="w-8 h-8" style={{ color: 'var(--color-info-default)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
                        10 Check-ins
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Bottom Tab Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="flex justify-around p-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  {[
                    { icon: <Layout className="w-5 h-5" />, label: 'Home', active: true },
                    { icon: <Activity className="w-5 h-5" />, label: 'Track', active: false },
                    { icon: <MessageCircle className="w-5 h-5" />, label: 'Journal', active: false },
                    { icon: <Brain className="w-5 h-5" />, label: 'Learn', active: false },
                    { icon: <Settings className="w-5 h-5" />, label: 'Profile', active: false }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="flex flex-col items-center gap-1 transition-colors"
                      style={{
                        color: item.active ? 'var(--color-primary-default)' : 'var(--color-text-muted)'
                      }}
                    >
                      {item.icon}
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: item.active ? 'var(--font-weight-medium)' : 'normal' }}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 3: Visualization & Insights */}
        {activeSection === 'visualization' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              3. Information, Insight & Feedback Components
            </h2>

            {/* Mood Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Tracking Visualization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mock Line Chart */}
                <div className="space-y-3">
                  <Label>7-Day Mood Trend</Label>
                  <div 
                    className="h-48 rounded-lg flex items-end justify-around gap-2 p-4"
                    style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  >
                    {[6, 7, 5, 8, 6, 7, 9].map((value, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t-lg transition-all hover:opacity-80"
                        style={{
                          height: `${value * 10}%`,
                          backgroundColor: value >= 7 ? 'var(--color-success-default)' : value >= 5 ? 'var(--color-warning-default)' : 'var(--color-danger-default)'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>

                {/* Heatmap Calendar */}
                <div className="space-y-3">
                  <Label>Monthly Activity Heatmap</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }, (_, i) => {
                      const intensity = Math.floor(Math.random() * 4);
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded transition-all hover:scale-110"
                          style={{
                            backgroundColor: 
                              intensity === 0 ? 'var(--color-bg-muted)' :
                              intensity === 1 ? 'rgba(16, 185, 129, 0.3)' :
                              intensity === 2 ? 'rgba(16, 185, 129, 0.6)' :
                              'rgba(16, 185, 129, 1)'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Insight & Recommendation Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Daily Insight */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--color-accent-default)',
                    border: '1px solid var(--color-border-default)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 mt-1" style={{ color: 'var(--color-success-default)' }} />
                    <div className="flex-1">
                      <h4 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 'var(--spacing-1)'
                        }}
                      >
                        Your mood has been trending upward
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Over the past week, you've logged higher mood scores on days when you exercised.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Card */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
                >
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 mt-1" style={{ color: 'var(--color-primary-default)' }} />
                    <div className="flex-1">
                      <h4 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 'var(--spacing-1)'
                        }}
                      >
                        Try: 5-Minute Breathing Exercise
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-3)' }}>
                        Based on your recent stress levels, this guided breathing may help.
                      </p>
                      <Button size="sm" variant="outline">Start Exercise</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 4: Therapy & Support */}
        {activeSection === 'therapy' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              4. Therapy, Support & Crisis Components
            </h2>

            {/* Chat Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Chat Interface (Therapist/Peer Support)</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="space-y-3 p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)', minHeight: '300px' }}
                >
                  {/* Received Message */}
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                    >
                      T
                    </div>
                    <div 
                      className="flex-1 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-card)' }}
                    >
                      <p style={{ fontSize: 'var(--text-sm)' }}>
                        How have you been feeling since our last session?
                      </p>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        2:34 PM
                      </span>
                    </div>
                  </div>

                  {/* Sent Message */}
                  <div className="flex gap-3 justify-end">
                    <div 
                      className="flex-1 max-w-md p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                    >
                      <p style={{ fontSize: 'var(--text-sm)' }}>
                        Much better! I've been using the techniques we discussed.
                      </p>
                      <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8 }}>
                        2:35 PM
                      </span>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 pt-4">
                    <Input 
                      placeholder="Type a message..."
                      style={{ flex: 1 }}
                    />
                    <Button size="sm">Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio/Video Players */}
            <Card>
              <CardHeader>
                <CardTitle>Media Players (Guided Sessions)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Player */}
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <p 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 'var(--spacing-1)'
                        }}
                      >
                        10-Minute Guided Meditation
                      </p>
                      <Progress value={45} />
                      <div className="flex justify-between mt-1">
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>4:32</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>10:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Player Placeholder */}
                <div 
                  className="aspect-video rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <button
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary-default)', color: 'var(--color-primary-on)' }}
                  >
                    <Play className="w-8 h-8" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Crisis Support */}
            <Card>
              <CardHeader>
                <CardTitle>Crisis & Emergency Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Crisis Modal Preview */}
                <div 
                  className="p-6 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--color-danger-default)', 
                    color: 'white'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <LifeBuoy className="w-6 h-6 mt-1" />
                    <div className="flex-1">
                      <h4 
                        style={{ 
                          fontSize: 'var(--text-lg)', 
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 'var(--spacing-2)'
                        }}
                      >
                        Need immediate support?
                      </h4>
                      <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-4)' }}>
                        You're not alone. Help is available 24/7.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          style={{ 
                            backgroundColor: 'white', 
                            color: 'var(--color-danger-default)',
                            borderColor: 'white'
                          }}
                        >
                          Call Hotline
                        </Button>
                        <Button 
                          variant="outline"
                          style={{ borderColor: 'white', color: 'white' }}
                        >
                          Text Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource List */}
                <div className="space-y-2">
                  <Label>Crisis Resources</Label>
                  <div className="space-y-2">
                    {[
                      { name: 'National Crisis Hotline', number: '988' },
                      { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
                      { name: 'International Support', number: 'findahelpline.com' }
                    ].map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg-muted)' }}
                      >
                        <span style={{ fontSize: 'var(--text-sm)' }}>{resource.name}</span>
                        <Badge>{resource.number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 5: Personalization */}
        {activeSection === 'personalization' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              5. Personalization & Profile Components
            </h2>

            {/* Preference Toggles */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Daily mood check-in reminders', description: 'Get a gentle reminder to log your mood' },
                  { label: 'Weekly progress reports', description: 'See your patterns and insights' },
                  { label: 'Content recommendations', description: 'Personalized exercises and articles' },
                  { label: 'Community updates', description: 'New resources and support groups' }
                ].map((pref, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-muted)' }}
                  >
                    <Switch id={`pref-${idx}`} defaultChecked={idx < 2} />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`pref-${idx}`}
                        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {pref.label}
                      </Label>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {pref.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Theme Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Accessibility & Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Text Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <Label>Dark Mode</Label>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <Label>High Contrast</Label>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <Label>Reduce Motion</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 6: Emotional Design */}
        {activeSection === 'emotional-design' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              6. Emotional Design & Accessibility
            </h2>

            {/* Empty States */}
            <Card>
              <CardHeader>
                <CardTitle>Empty States (Encouraging, Non-Judgmental)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="p-8 text-center rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-accent-default)' }}
                  >
                    <Heart className="w-8 h-8" style={{ color: 'var(--color-primary-default)' }} />
                  </div>
                  <h3 
                    style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-2)'
                    }}
                  >
                    Your journey starts here
                  </h3>
                  <p 
                    style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--spacing-4)'
                    }}
                  >
                    No entries yet. That's okay! Every journey begins with a single step.
                  </p>
                  <Button>
                    <Heart className="w-4 h-4 mr-2" />
                    Start First Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading States */}
            <Card>
              <CardHeader>
                <CardTitle>Loading States (Calming Animations)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Breathing Animation */}
                <div 
                  className="p-8 text-center rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: 'var(--color-primary-default)',
                      opacity: 0.6
                    }}
                  />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Loading your data...
                  </p>
                </div>

                {/* Skeleton States */}
                <div className="space-y-3">
                  <div 
                    className="h-4 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-bg-muted)', width: '80%' }}
                  />
                  <div 
                    className="h-4 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-bg-muted)', width: '60%' }}
                  />
                  <div 
                    className="h-4 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-bg-muted)', width: '70%' }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Micro-affirmations */}
            <Card>
              <CardHeader>
                <CardTitle>Micro-Affirmations (Toast Notifications)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Heart className="w-5 h-5" />, message: 'You showed up today 💙', color: 'var(--color-success-default)' },
                  { icon: <Award className="w-5 h-5" />, message: 'Progress, not perfection', color: 'var(--color-info-default)' },
                  { icon: <Zap className="w-5 h-5" />, message: '3 days of self-care', color: 'var(--color-warning-default)' }
                ].map((toast, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--color-bg-card)',
                      border: `2px solid ${toast.color}`
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: toast.color, color: 'white' }}
                    >
                      {toast.icon}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {toast.message}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 7: Content Editing Tools */}
        {activeSection === 'editing' && (
          <div className="space-y-6">
            <h2 
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}
            >
              7. Content Editing Tools
            </h2>

            {/* Color Picker */}
            <Card>
              <CardHeader>
                <CardTitle>Color Picker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="w-16 h-16 rounded-lg cursor-pointer"
                    style={{ border: '2px solid var(--color-border-default)' }}
                  />
                  <div className="flex-1">
                    <Label>Primary Color</Label>
                    <Input 
                      value={editingColor} 
                      onChange={(e) => setEditingColor(e.target.value)}
                      placeholder="#2A2A2A"
                    />
                  </div>
                </div>

                {/* Color Presets */}
                <div className="space-y-2">
                  <Label>Preset Colors</Label>
                  <div className="flex gap-2">
                    {['#2A2A2A', '#E9EBEF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingColor(color)}
                        className="w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110"
                        style={{ 
                          backgroundColor: color,
                          borderColor: editingColor === color ? 'var(--color-primary-default)' : 'var(--color-border-default)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div 
                  className="p-6 rounded-lg text-center"
                  style={{ backgroundColor: editingColor, color: 'white' }}
                >
                  <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                    Preview Text
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Font Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Typography Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Font Family</Label>
                  <Select defaultValue="ubuntu">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ubuntu">Ubuntu (Default)</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editingFontSize}
                      onChange={(e) => setEditingFontSize(e.target.value)}
                      placeholder="16"
                      className="w-24"
                    />
                    <span className="flex items-center">px</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Font Weight</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {}}
                    >
                      Regular (400)
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {}}
                    >
                      Medium (500)
                    </Button>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    ⚠️ iKan design system only uses Regular (400) and Medium (500) weights
                  </p>
                </div>

                {/* Preview */}
                <div 
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <p style={{ fontSize: `${editingFontSize}px`, fontFamily: 'var(--font-family-base)' }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Icon/Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Icon & Image Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  style={{ borderColor: 'var(--color-border-default)' }}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
                    Drag & drop or click to upload
                  </p>
                  <Button size="sm" variant="outline">Choose File</Button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-bg-muted)' }}
                    >
                      <ImageIcon className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Background Image Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Background Image Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Background Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editingBgImage}
                      onChange={(e) => setEditingBgImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <Button variant="outline">Upload</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Background Position</Label>
                  <Select defaultValue="center">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Background Size</Label>
                  <Select defaultValue="cover">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview */}
                <div 
                  className="h-48 rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--color-bg-muted)',
                    backgroundImage: editingBgImage ? `url(${editingBgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <p 
                    className="px-4 py-2 rounded"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    Background Preview
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
