import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '../product/site/ui/input';
import { Label } from '../product/site/ui/label';
import { Button } from '../product/site/ui/button';
import { Checkbox } from '../product/site/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../product/site/ui/select';

/**
 * iKAN Contact Form — mirrors the contact page form from ikan2/src/routes/contact.tsx
 *
 * Fields: Name, Email, Subject (select), Message (textarea), Submit button
 * Validation: shown after first submit attempt (touched state)
 * Success state: green checkmark card matching ikan2 success UI
 */

function ContactForm({ showSuccess = false }: { showSuccess?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(showSuccess);

  const errors = {
    name: !name.trim() ? 'Please enter your name.' : name.trim().length < 2 ? 'Name must be at least 2 characters.' : undefined,
    email: !email.trim() ? 'Please enter your email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : undefined,
    message: !message.trim() ? 'Please write a message.' : message.trim().length < 10 ? 'Write a little more (10+ characters).' : undefined,
  };
  const ok = !errors.name && !errors.email && !errors.message;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <div style={{ width: 360, padding: '24px', background: 'var(--background)', borderRadius: 20, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', paddingBlock: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DFF0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2B634D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="type-headline-sm">Message sent!</p>
          <p className="type-body text-muted-foreground">We'll get back to you within one business day.</p>
          <button
            className="type-action inline-flex h-10 items-center rounded-full bg-foreground px-5 text-background mt-2"
            onClick={() => { setSent(false); setTouched(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16, padding: 24, background: 'var(--background)', borderRadius: 20, border: '1px solid var(--border)' }}
      noValidate
    >
      <p className="type-subhead">Send us a message</p>
      <p className="type-body-md text-muted-foreground" style={{ marginTop: -8 }}>Fill out the form and we'll get back to you.</p>

      {/* Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="cf-name">Name</Label>
        <Input
          id="cf-name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          aria-invalid={touched && !!errors.name}
        />
        {touched && errors.name && <p className="type-body-sm" style={{ color: 'var(--error)' }}>{errors.name}</p>}
      </div>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="cf-email">Email</Label>
        <Input
          id="cf-email"
          type="email"
          placeholder="name@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-invalid={touched && !!errors.email}
        />
        {touched && errors.email && <p className="type-body-sm" style={{ color: 'var(--error)' }}>{errors.email}</p>}
      </div>

      {/* Subject */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="cf-subject">Subject</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger id="cf-subject">
            <SelectValue placeholder="Choose a topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General enquiry</SelectItem>
            <SelectItem value="assessment">Assessment / Results</SelectItem>
            <SelectItem value="programs">Equip Programs</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="privacy">Privacy / Data</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="cf-message">Message</Label>
        <textarea
          id="cf-message"
          rows={5}
          placeholder="Describe what you need help with…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          aria-invalid={touched && !!errors.message}
          style={{
            width: '100%', borderRadius: 12, border: '1px solid var(--border)',
            padding: '10px 14px', fontSize: 15, lineHeight: '24px',
            background: 'var(--background)', color: 'var(--foreground)',
            resize: 'vertical', fontFamily: 'Manrope, sans-serif',
            outline: 'none',
          }}
        />
        {touched && errors.message && <p className="type-body-sm" style={{ color: 'var(--error)' }}>{errors.message}</p>}
      </div>

      <button
        type="submit"
        className="type-action inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-background"
        style={{ marginTop: 4 }}
      >
        Send message
      </button>
    </form>
  );
}

const meta: Meta = {
  title: 'iKAN/Forms/ContactForm',
  component: ContactForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const Empty: Story = {
  args: { showSuccess: false },
  name: 'Empty (initial state)',
};

export const Success: Story = {
  args: { showSuccess: true },
  name: 'Success state',
};
