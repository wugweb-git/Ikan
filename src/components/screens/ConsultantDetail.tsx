import React, { useState, useEffect } from 'react';
import { cn } from '../ui/utils';
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  MapPin, 
  Calendar as CalendarIcon,
  Video, 
  Phone, 
  MessageCircle,
  ChevronRight,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { consultantsData, type Consultant, type ConsultantAvailability } from '../../lib/sample-data/consultants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { toast } from 'sonner';

interface ConsultantDetailProps {
  consultantId?: string;
  onNavigate?: (route: string) => void;
  className?: string;
}

export function ConsultantDetail({ consultantId, onNavigate, className }: ConsultantDetailProps) {
  const isMobile = useIsMobile();
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<'video' | 'call' | 'chat' | 'offline'>('video');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionerName, setQuestionerName] = useState('');

  useEffect(() => {
    // Find consultant by ID
    const found = consultantsData.find(c => c.id === consultantId);
    if (found) {
      setConsultant(found);
      // Set first available date
      if (found.availability.length > 0) {
        setSelectedDate(found.availability[0].date);
      }
    }
  }, [consultantId]);

  if (!consultant) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
          Consultant not found
        </p>
      </div>
    );
  }

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/consultation');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${consultant.name} - ${consultant.credentials}`,
      text: `Connect with ${consultant.name} on iKan`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
      setShowShareDialog(true);
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setShowBookingDialog(true);
  };

  const confirmBooking = () => {
    toast.success(`Booking confirmed with ${consultant.name} on ${selectedDate} at ${selectedTime}`);
    setShowBookingDialog(false);
  };

  const handleAskQuestion = () => {
    if (!questionText.trim() || !questionerName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    toast.success('Your question has been submitted. The consultant will respond soon.');
    setShowQuestionDialog(false);
    setQuestionText('');
    setQuestionerName('');
  };

  const availableSlots = consultant.availability.find(a => a.date === selectedDate)?.slots || [];
  const currentPrice = consultant.pricing[selectedSessionType as keyof typeof consultant.pricing] || 0;

  const categoryLabel = {
    'therapist': 'Therapist',
    'psychiatrist': 'Psychiatrist',
    'counselor': 'Counselor',
    'family-therapist': 'Family Therapist'
  }[consultant.category];

  return (
    <div className={cn("flex flex-col min-h-screen", className)} style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header - Always Visible */}
      <div style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
        <div style={{ padding: 'var(--spacing-4)', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              style={{
                height: '48px',
                padding: '0 var(--spacing-3)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              style={{
                height: '48px',
                padding: '0 var(--spacing-3)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
          {/* Profile Header */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <div className={cn("flex gap-6", isMobile && "flex-col items-center text-center")}>
                {/* Photo */}
                <Avatar style={{ width: isMobile ? '120px' : '160px', height: isMobile ? '120px' : '160px' }}>
                  <AvatarImage src={consultant.photo} alt={consultant.name} />
                  <AvatarFallback style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-medium)' }}>
                    {consultant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h1 style={{ 
                        fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)', 
                        fontWeight: 'var(--font-weight-medium)',
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {consultant.name}
                      </h1>
                      <p style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-regular)',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-2)'
                      }}>
                        {consultant.credentials}
                      </p>
                    </div>
                    {!isMobile && (
                      <Badge variant="secondary" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                        {categoryLabel}
                      </Badge>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" style={{ color: '#FFA500' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {consultant.rating}
                      </span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                        ({consultant.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                        {consultant.yearsExperience} years experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                        {consultant.location}
                      </span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                      Languages:
                    </span>
                    {consultant.languages.map(lang => (
                      <Badge key={lang} variant="outline" style={{ fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-xs)' }}>
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  {/* Session Modes */}
                  <div className="flex flex-wrap gap-2">
                    {consultant.sessionModes.map(mode => (
                      <Badge key={mode} style={{ fontWeight: 'var(--font-weight-regular)', fontSize: 'var(--text-xs)' }}>
                        {mode === 'online' && <Video className="mr-1 h-3 w-3" />}
                        {mode === 'call' && <Phone className="mr-1 h-3 w-3" />}
                        {mode === 'chat' && <MessageCircle className="mr-1 h-3 w-3" />}
                        {mode === 'offline' && <MapPin className="mr-1 h-3 w-3" />}
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concerns I Can Help With */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <h2 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Concerns I Can Help With
              </h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)' }}>
                {consultant.concernsICanHelp.map((concern, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--spacing-4)',
                      backgroundColor: 'var(--color-bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--color-primary-default)'
                    }}
                  >
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-regular)',
                      fontStyle: 'italic',
                      color: 'var(--color-text-primary)'
                    }}>
                      "{concern}"
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* I Offer Therapy For */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <h2 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                I Offer Therapy For
              </h2>
              <div className="flex flex-wrap gap-2">
                {consultant.expertises.map((expertise, index) => (
                  <Badge
                    key={index}
                    variant={consultant.topExpertises.includes(expertise) ? 'default' : 'secondary'}
                    style={{ 
                      fontWeight: 'var(--font-weight-regular)', 
                      fontSize: 'var(--text-sm)',
                      padding: 'var(--spacing-2) var(--spacing-3)'
                    }}
                  >
                    {consultant.topExpertises.includes(expertise) && (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    )}
                    {expertise}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About & Approaches */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                    About
                  </TabsTrigger>
                  <TabsTrigger value="approaches" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                    Approaches
                  </TabsTrigger>
                  <TabsTrigger value="qualifications" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}>
                    Qualifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="about">
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    fontWeight: 'var(--font-weight-regular)',
                    lineHeight: 'var(--line-height-lg)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {consultant.bio}
                  </p>
                </TabsContent>

                <TabsContent value="approaches">
                  <div className="space-y-3">
                    {consultant.approaches.map((approach, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 'var(--spacing-3)',
                          backgroundColor: 'var(--color-bg-muted)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                          {approach}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="qualifications">
                  <ul className="space-y-2">
                    {consultant.qualifications.map((qual, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 mt-1" style={{ color: 'var(--color-primary-default)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                          {qual}
                        </span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <h2 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Reviews ({consultant.reviewCount})
              </h2>
              <div className="space-y-4">
                {consultant.reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: 'var(--spacing-4)',
                      backgroundColor: 'var(--color-bg-muted)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                            {review.patientName}
                          </span>
                          {review.verified && (
                            <Badge variant="outline" style={{ fontSize: '10px', fontWeight: 'var(--font-weight-regular)' }}>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3"
                              style={{ color: i < review.rating ? '#FFA500' : '#E0E0E0' }}
                              fill={i < review.rating ? '#FFA500' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontWeight: 'var(--font-weight-regular)',
                      marginBottom: 'var(--spacing-2)'
                    }}>
                      {review.comment}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ height: '32px', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)' }}
                      >
                        <ThumbsUp className="mr-1 h-3 w-3" />
                        Helpful ({review.helpful})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <h2 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible>
                {consultant.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Q&A Section */}
          <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                  Questions & Answers
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuestionDialog(true)}
                  style={{ height: '36px', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)' }}
                >
                  Ask a Question
                </Button>
              </div>
              <div className="space-y-4">
                {consultant.qas.length > 0 ? (
                  consultant.qas.map((qa) => (
                    <div
                      key={qa.id}
                      style={{
                        padding: 'var(--spacing-4)',
                        backgroundColor: 'var(--color-bg-muted)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div className="mb-3">
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                          Q: {qa.question}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                          Asked by {qa.askedBy} on {new Date(qa.askedDate).toLocaleDateString()}
                        </p>
                      </div>
                      {qa.answer && (
                        <div style={{ 
                          padding: 'var(--spacing-3)', 
                          backgroundColor: 'var(--color-bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--color-primary-default)'
                        }}>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', marginBottom: 'var(--spacing-1)' }}>
                            A: {qa.answer}
                          </p>
                          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                            Answered on {qa.answeredDate ? new Date(qa.answeredDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                    No questions yet. Be the first to ask!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Articles */}
          {consultant.articles.length > 0 && (
            <Card style={{ marginBottom: 'var(--spacing-6)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent style={{ padding: isMobile ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
                <h2 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-4)'
                }}>
                  Articles & Insights
                </h2>
                <div className="space-y-3">
                  {consultant.articles.map((article) => (
                    <div
                      key={article.id}
                      style={{
                        padding: 'var(--spacing-4)',
                        backgroundColor: 'var(--color-bg-muted)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer'
                      }}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                            {article.title}
                          </h3>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-2)' }}>
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                              {new Date(article.date).toLocaleDateString()}
                            </span>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                              <Clock className="inline h-3 w-3 mr-1" />
                              {article.readTime}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile Spacing for Fixed Button */}
          {isMobile && <div style={{ height: '80px' }} />}
        </div>

        {/* Booking Panel - Desktop Sticky Sidebar */}
        {!isMobile && (
          <div style={{ width: '380px', padding: 'var(--spacing-6) var(--spacing-4) var(--spacing-6) 0' }}>
            <div style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
              <BookingPanel
                consultant={consultant}
                selectedSessionType={selectedSessionType}
                setSelectedSessionType={setSelectedSessionType}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                availableSlots={availableSlots}
                currentPrice={currentPrice}
                onBook={handleBooking}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fixed Booking Button */}
      {isMobile && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-bg-card)',
          borderTop: '1px solid var(--color-border-default)',
          zIndex: 50
        }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
                Starting from
              </p>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
                ₹{Math.min(...Object.values(consultant.pricing).filter(p => p > 0))}
              </p>
            </div>
            <Button
              onClick={handleBooking}
              disabled={!consultant.available}
              style={{
                height: '48px',
                padding: '0 var(--spacing-6)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--text-sm)'
              }}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      )}

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>Confirm Booking</DialogTitle>
            <DialogDescription style={{ fontWeight: 'var(--font-weight-regular)' }}>
              Please confirm your appointment details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Consultant:</p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>{consultant.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Date & Time:</p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                {selectedDate} at {selectedTime}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Session Type:</p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)' }}>
                {selectedSessionType.charAt(0).toUpperCase() + selectedSessionType.slice(1)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>Amount:</p>
              <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>₹{currentPrice}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBookingDialog(false)}
                style={{ flex: 1, height: '48px', fontWeight: 'var(--font-weight-medium)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmBooking}
                style={{ flex: 1, height: '48px', fontWeight: 'var(--font-weight-medium)' }}
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 'var(--font-weight-medium)' }}>Ask a Question</DialogTitle>
            <DialogDescription style={{ fontWeight: 'var(--font-weight-regular)' }}>
              Your question will be public and answered by {consultant.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="questioner-name" style={{ fontWeight: 'var(--font-weight-medium)' }}>Your Name</Label>
              <Input
                id="questioner-name"
                value={questionerName}
                onChange={(e) => setQuestionerName(e.target.value)}
                placeholder="Enter your name"
                style={{ height: '48px', marginTop: 'var(--spacing-2)' }}
              />
            </div>
            <div>
              <Label htmlFor="question-text" style={{ fontWeight: 'var(--font-weight-medium)' }}>Your Question</Label>
              <Textarea
                id="question-text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                rows={4}
                style={{ marginTop: 'var(--spacing-2)' }}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowQuestionDialog(false)}
                style={{ flex: 1, height: '48px', fontWeight: 'var(--font-weight-medium)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAskQuestion}
                style={{ flex: 1, height: '48px', fontWeight: 'var(--font-weight-medium)' }}
              >
                Submit Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Booking Panel Component
interface BookingPanelProps {
  consultant: Consultant;
  selectedSessionType: 'video' | 'call' | 'chat' | 'offline';
  setSelectedSessionType: (type: 'video' | 'call' | 'chat' | 'offline') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  availableSlots: { time: string; available: boolean; }[];
  currentPrice: number;
  onBook: () => void;
}

function BookingPanel({
  consultant,
  selectedSessionType,
  setSelectedSessionType,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  availableSlots,
  currentPrice,
  onBook
}: BookingPanelProps) {
  return (
    <Card style={{ borderRadius: 'var(--radius-lg)' }}>
      <CardContent style={{ padding: 'var(--spacing-4)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-4)' }}>
          Book Appointment
        </h3>

        {/* Session Type Selector */}
        <div className="mb-4">
          <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-2)', display: 'block' }}>
            Session Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {consultant.sessionModes.map(mode => {
              const modeKey = mode as 'video' | 'call' | 'chat' | 'offline';
              const price = consultant.pricing[modeKey];
              if (!price) return null;

              return (
                <Button
                  key={mode}
                  variant={selectedSessionType === mode ? 'default' : 'outline'}
                  onClick={() => setSelectedSessionType(modeKey)}
                  style={{ 
                    height: '48px', 
                    justifyContent: 'flex-start',
                    fontWeight: 'var(--font-weight-regular)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {mode === 'video' && <Video className="mr-2 h-4 w-4" />}
                  {mode === 'call' && <Phone className="mr-2 h-4 w-4" />}
                  {mode === 'chat' && <MessageCircle className="mr-2 h-4 w-4" />}
                  {mode === 'offline' && <MapPin className="mr-2 h-4 w-4" />}
                  <div className="text-left flex-1">
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)' }}>
                      ₹{price}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Date Selector */}
        <div className="mb-4">
          <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-2)', display: 'block' }}>
            Select Date
          </Label>
          <div className="flex flex-col gap-2">
            {consultant.availability.map((avail) => (
              <Button
                key={avail.date}
                variant={selectedDate === avail.date ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedDate(avail.date);
                  setSelectedTime(''); // Reset time when date changes
                }}
                style={{ 
                  height: '40px',
                  justifyContent: 'flex-start',
                  fontWeight: 'var(--font-weight-regular)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {new Date(avail.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="mb-4">
            <Label style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-2)', display: 'block' }}>
              Available Times
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  style={{ 
                    height: '36px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-regular)'
                  }}
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Price Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
              Session Fee
            </span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-medium)' }}>
              ₹{currentPrice}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={onBook}
          disabled={!consultant.available || !selectedDate || !selectedTime}
          style={{ 
            width: '100%',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--text-sm)'
          }}
        >
          {consultant.available ? 'Book Appointment' : 'Not Available'}
        </Button>

        {/* Next Available */}
        {consultant.available && (
          <div className="mt-3 text-center">
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)' }}>
              Next available: {consultant.nextAvailableSlot}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}