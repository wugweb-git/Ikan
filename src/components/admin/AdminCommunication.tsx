import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export function AdminCommunication() {
  const { showToast } = useNotifications();

  const handleSend = (type: string) => {
    showToast('success', 'Message Sent', `Test ${type} has been queued for delivery.`);
  };

  return (
    <div className="space-y-6">
      <div>
         <h2 className="text-2xl font-bold tracking-tight">Communication Center</h2>
         <p className="text-muted-foreground">Manage system-wide notifications and messaging.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Send mobile push alerts to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Title" />
            <Textarea placeholder="Message body..." className="min-h-[100px]" />
            <Button onClick={() => handleSend('notification')} className="w-full">Send Push</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Send newsletters and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Subject" />
            <Textarea placeholder="Email content..." className="min-h-[100px]" />
            <Button variant="outline" onClick={() => handleSend('email')} className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle>In-App Messages</CardTitle>
            <CardDescription>Display modal or banner messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Heading" />
            <Textarea placeholder="Message..." className="min-h-[100px]" />
            <Button variant="outline" onClick={() => handleSend('in-app message')} className="w-full">Post Message</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
