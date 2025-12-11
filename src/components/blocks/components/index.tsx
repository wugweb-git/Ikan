import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { 
  ArrowRightIcon, 
  BookmarkIcon, 
  CalendarIcon, 
  ChatIcon, 
  SettingsIcon,
  CheckCircleIcon,
  ErrorIcon 
} from '../../Icon';
import { cn } from '../../ui/utils';

// Resource Card Component
interface ResourceCardProps {
  title?: string;
  description?: string;
  category?: string;
  readTime?: string;
  isBookmarked?: boolean;
  className?: string;
  interactions?: string[];
}

export function ResourceCard({ 
  title = "Mental Health Resource",
  description = "Learn effective techniques for managing stress and anxiety in daily life.",
  category = "Wellness",
  readTime = "5 min read",
  isBookmarked = false,
  className,
  interactions
}: ResourceCardProps) {
  const [bookmarked, setBookmarked] = React.useState(isBookmarked);

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2">{category}</Badge>
          {interactions?.includes('bookmark') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setBookmarked(!bookmarked)}
            >
              <BookmarkIcon 
                variant={bookmarked ? 'filled' : 'outline'} 
                size={16}
                className={bookmarked ? 'text-primary' : 'text-muted-foreground'}
              />
            </Button>
          )}
        </div>
        <CardTitle className="text-lg leading-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">{readTime}</span>
          <Button variant="ghost" size="sm">
            Read more
            <ArrowRightIcon size={14} className="ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// User Avatar Component
interface UserAvatarProps {
  src?: string;
  name?: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  interactions?: string[];
}

export function UserAvatar({ 
  src,
  name = "John Doe",
  email = "john@example.com",
  size = 'lg',
  className,
  interactions
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback>
          {name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{email}</div>
      </div>
      {interactions?.includes('edit') && (
        <Button variant="outline" size="sm" className="ml-auto">
          <SettingsIcon size={14} className="mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
}

// Text Input Component
interface TextInputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  interactions?: string[];
}

export function TextInput({ 
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  className,
  interactions
}: TextInputProps) {
  const [inputValue, setInputValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <Input
        id={label}
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

// Switch Toggle Component
interface SwitchToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  interactions?: string[];
}

export function SwitchToggle({ 
  label,
  checked = false,
  onChange,
  className,
  interactions
}: SwitchToggleProps) {
  const [isChecked, setIsChecked] = React.useState(checked);

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {label && <Label htmlFor={label}>{label}</Label>}
      <Switch
        id={label}
        checked={isChecked}
        onCheckedChange={handleChange}
      />
    </div>
  );
}

// Button Components
interface ButtonPrimaryProps {
  label?: string;
  onClick?: () => void;
  icons?: {
    leading?: string;
    trailing?: string;
  };
  className?: string;
  interactions?: string[];
}

export function ButtonPrimary({ 
  label = "Button",
  onClick,
  icons,
  className,
  interactions
}: ButtonPrimaryProps) {
  return (
    <Button 
      onClick={onClick}
      className={cn("w-full", className)}
    >
      {icons?.leading && <span className="mr-2">→</span>}
      {label}
      {icons?.trailing && <ArrowRightIcon size={16} className="ml-2" />}
    </Button>
  );
}

interface ButtonLinkProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  interactions?: string[];
}

export function ButtonLink({ 
  label = "Link",
  onClick,
  className,
  interactions
}: ButtonLinkProps) {
  return (
    <Button 
      variant="link"
      onClick={onClick}
      className={className}
    >
      {label}
    </Button>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  interactions?: string[];
}

export function ProgressBar({ 
  value = 0,
  label,
  showPercentage = true,
  className,
  interactions
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && <span className="text-sm text-muted-foreground">{value}%</span>}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
}

// Consultation Directory Card
interface ConsultationDirectoryCardProps {
  name?: string;
  specialty?: string;
  rating?: number;
  nextAvailable?: string;
  className?: string;
  interactions?: string[];
}

export function ConsultationDirectoryCard({ 
  name = "Dr. Sarah Johnson",
  specialty = "Clinical Psychologist",
  rating = 4.8,
  nextAvailable = "Tomorrow, 2:00 PM",
  className,
  interactions
}: ConsultationDirectoryCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{specialty}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({rating})</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Next available: </span>
          <span className="font-medium">{nextAvailable}</span>
        </div>
      </CardContent>
      <CardFooter>
        {interactions?.includes('book') && (
          <Button className="w-full">
            Book Consultation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Mood Journal Emoji Set
interface MoodJournalEmojiSetProps {
  onSelectMood?: (moodId: string) => void;
  selectedMood?: string;
  className?: string;
  interactions?: string[];
}

export function MoodJournalEmojiSet({ 
  onSelectMood,
  selectedMood,
  className,
  interactions
}: MoodJournalEmojiSetProps) {
  const moods = [
    { id: "awful", emoji: "😫", label: "Awful" },
    { id: "bad", emoji: "😕", label: "Bad" },
    { id: "meh", emoji: "😐", label: "Meh" },
    { id: "good", emoji: "🙂", label: "Good" },
    { id: "great", emoji: "😄", label: "Great" }
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="font-medium">How are you feeling today?</h4>
      <div className="flex items-center justify-between gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelectMood?.(mood.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors hover:bg-muted/50",
              selectedMood === mood.id && "bg-primary/10 border-primary"
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-center">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Assessment Card
interface AssessmentCardProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  className?: string;
  interactions?: string[];
}

export function AssessmentCard({ 
  title = "Anxiety Assessment",
  description = "A brief questionnaire to help understand your current anxiety levels.",
  estimatedTime = "5-10 minutes",
  className,
  interactions
}: AssessmentCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon size={16} />
          Estimated time: {estimatedTime}
        </div>
      </CardContent>
      <CardFooter>
        {interactions?.includes('start') && (
          <Button className="w-full">
            Start Assessment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Stepper Component
interface StepperProps {
  currentStep?: number;
  totalSteps?: number;
  className?: string;
  interactions?: string[];
}

export function Stepper({ 
  currentStep = 1,
  totalSteps = 5,
  className,
  interactions
}: StepperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span>Step {currentStep} of {totalSteps}</span>
        <span className="text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
    </div>
  );
}

// Modal Components (simplified for demo)
export function ModalAssessmentIntro({ className, interactions }: { className?: string; interactions?: string[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Assessment Info</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assessment Introduction</DialogTitle>
        </DialogHeader>
        <p>This assessment will help us understand your current mental health status.</p>
      </DialogContent>
    </Dialog>
  );
}

// Chat Components
interface ChatPreviewCardProps {
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  className?: string;
  interactions?: string[];
}

export function ChatPreviewCard({ 
  lastMessage = "Hello! How can I help you today?",
  timestamp = "2 hours ago",
  unreadCount = 0,
  className,
  interactions
}: ChatPreviewCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ChatIcon size={20} className="text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">Support Chat</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{lastMessage}</p>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModalSupportChat({ className, interactions }: { className?: string; interactions?: string[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Chat</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Support Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="h-64 border rounded-md p-4 overflow-y-auto">
            <p className="text-sm">Chat messages would appear here...</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Type a message..." className="flex-1" />
            <Button size="sm">Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Blog Card
interface BlogCardProps {
  title?: string;
  excerpt?: string;
  author?: string;
  publishDate?: string;
  readTime?: string;
  className?: string;
  interactions?: string[];
}

export function BlogCard({ 
  title = "Understanding Anxiety: A Comprehensive Guide",
  excerpt = "Learn about the symptoms, causes, and effective treatment options for anxiety disorders.",
  author = "Dr. Emily Wilson",
  publishDate = "March 15, 2024",
  readTime = "8 min read",
  className,
  interactions
}: BlogCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-medium leading-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{excerpt}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>By {author}</span>
              <span>{publishDate}</span>
            </div>
            <span>{readTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export {
  ResourceCard,
  UserAvatar,
  TextInput,
  SwitchToggle,
  ButtonPrimary,
  ButtonLink,
  ProgressBar,
  ConsultationDirectoryCard,
  MoodJournalEmojiSet,
  AssessmentCard,
  Stepper,
  ModalAssessmentIntro,
  ChatPreviewCard,
  ModalSupportChat,
  BlogCard
};