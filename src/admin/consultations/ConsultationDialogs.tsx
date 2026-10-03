import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { BookingCalendar } from './BookingCalendar';

export const APPLICATION_LINK_PATH = '/join/professional';

// ── Reject application ─────────────────────────────────────────────

interface RejectApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  processing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RejectApplicationDialog({ open, onOpenChange, reason, onReasonChange, processing, onCancel, onConfirm }: RejectApplicationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium">Reject Application</DialogTitle>
          <DialogDescription>Please provide a reason for rejection (optional).</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Label className="font-medium text-sm mb-1 block">Rejection Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g., Incomplete credentials, unable to verify qualifications..."
            className="min-h-[80px] rounded-[var(--radius-md)]"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} disabled={processing}
            className="gap-2 bg-[var(--color-status-danger)] text-[var(--color-text-inverse)]">
            {processing ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Universal application link ─────────────────────────────────────

interface ShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
  onPreview: () => void;
}

export function ShareLinkDialog({ open, onOpenChange, onCopy, onPreview }: ShareLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-medium">Universal Application Link</DialogTitle>
          <DialogDescription>Share this link with professionals. They can fill out the application form on their device.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={`${window.location.origin}${APPLICATION_LINK_PATH}`}
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] font-mono text-sm border border-[var(--color-border-default)] outline-none break-all cursor-text"
            />
            <Button onClick={onCopy} className="gap-2 rounded-[var(--radius-md)]">
              <Copy className="w-4 h-4" /> Copy
            </Button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-[var(--line-height-lg)]">
            Applications submitted via this link will appear in the "Applications" tab above with a "Pending Review" status. You can then approve or reject them.
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={onPreview} className="gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary-default)] text-[var(--color-primary-on)]">
            <ExternalLink className="w-4 h-4" /> Preview Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Booking ────────────────────────────────────────────────────────

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionalName?: string;
  onBooked: (date: Date, time: string) => void;
}

export function BookingDialog({ open, onOpenChange, professionalName, onBooked }: BookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Book Consultation</DialogTitle></DialogHeader>
        <BookingCalendar professionalName={professionalName} onBookSlot={onBooked} />
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
