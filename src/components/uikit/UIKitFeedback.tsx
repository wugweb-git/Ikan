import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import { useNotifications } from '../../contexts/NotificationContext';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

export function UIKitFeedback() {
  const { showToast } = useNotifications();

  return (
    <div className="space-y-8">
      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Status Messages</CardTitle>
          <CardDescription>
            Semantic alerts for user feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>
              This is a standard information message.
            </AlertDescription>
          </Alert>
          
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Operation completed successfully.
            </AlertDescription>
          </Alert>
          
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Please review your input before proceeding.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>

          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Here is some useful context about the current page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Dialogs & Modals */}
      <Card>
        <CardHeader>
          <CardTitle>Dialogs & Modals</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog Modal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-right text-sm">Name</span>
                  <input className="col-span-3 border rounded px-2 py-1" defaultValue="Pedro Duarte" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              <p className="text-sm font-medium">Progress Bar</p>
              <Progress value={33} />
           </div>
           
           <div className="space-y-2">
              <p className="text-sm font-medium">Skeletons</p>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
           </div>

           <div className="space-y-2">
              <p className="text-sm font-medium">Spinner</p>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        </CardContent>
      </Card>

      {/* Toasts & Tooltips */}
      <Card>
        <CardHeader>
          <CardTitle>Toasts & Tooltips</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center">
           <Button 
             variant="outline" 
             onClick={() => showToast('success', 'Success', 'Action completed successfully')}
           >
             Show Success Toast
           </Button>
           
           <Button 
             variant="outline" 
             onClick={() => showToast('error', 'Error', 'Something went wrong')}
           >
             Show Error Toast
           </Button>

           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button variant="secondary">Hover me (Tooltip)</Button>
               </TooltipTrigger>
               <TooltipContent>
                 <p>This is a tooltip helper text</p>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}