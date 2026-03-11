import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Calendar } from '../ui/calendar';
import { Icon } from '../Icon';
import { Star } from 'lucide-react';

export function UIKitForms() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rating, setRating] = useState(3);

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs & Textareas</CardTitle>
          <CardDescription>
            Height: 48px, Radius: 12px. Constraints: Min 240px, Max 560px.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <Label>Standard Input</Label>
            <Input placeholder="Enter text..." />
          </div>

          <div className="space-y-2">
            <Label>Input with Icons</Label>
            <Input 
              startIcon={<Icon name="mail" size={18} />} 
              placeholder="Email address" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-destructive">Error State</Label>
            <Input 
              placeholder="Invalid input" 
              className="border-destructive focus-visible:ring-destructive"
              aria-invalid="true"
            />
            <p className="text-xs text-destructive">This field is required.</p>
          </div>

          <div className="space-y-2">
            <Label>Disabled State</Label>
            <Input disabled placeholder="Cannot type here" />
          </div>

          <div className="space-y-2">
            <Label>Textarea</Label>
            <Textarea placeholder="Type your message here." />
          </div>
        </CardContent>
      </Card>

      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Selection Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          {/* Checkboxes */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Checkboxes</h4>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="disabled" disabled checked />
              <Label htmlFor="disabled">Disabled Checked</Label>
            </div>
          </div>

          {/* Radio Buttons */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Radio Buttons</h4>
            <RadioGroup defaultValue="option-one">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">Option One</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">Option Two</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Toggles / Switches</h4>
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Airplane Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" checked />
              <Label htmlFor="notifications">Notifications</Label>
            </div>
          </div>

          {/* Select / Dropdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Dropdown / Select</h4>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label>Slider / Range</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>

          <div className="space-y-4">
            <Label>Rating Pattern</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : ''}`}
                    style={star <= rating ? undefined : { color: 'var(--color-border-default)' }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Calendar / Date Picker</Label>
            <div className="border rounded-md p-4 w-fit bg-white">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}