import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  Video,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { useNotifications } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api-client';
import { Consultant, expertiseCategories } from '../../lib/sample-data/consultants';
import { cn } from '../ui/utils';

interface AdminConsultationManagerProps {
  onBack: () => void;
}

export function AdminConsultationManager({ onBack }: AdminConsultationManagerProps) {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Consultant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Consultant | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<Consultant>>({
    name: '',
    credentials: '',
    category: 'therapist',
    location: '',
    yearsExperience: 0,
    languages: [],
    expertises: [],
    sessionModes: ['online'],
    pricing: { video: 1000, call: 800, chat: 500 },
    bio: '',
    available: true
  });

  // Load professionals
  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getProfessionals();
      // Handle both array and object response formats
      const data = Array.isArray(result) ? result : (result.professionals || []);
      setProfessionals(data);
    } catch (error) {
      console.error('Failed to load professionals:', error);
      showToast('error', 'Error', 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = professionals.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.expertises.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category) {
        showToast('error', 'Validation Error', 'Name and category are required');
        return;
      }

      setLoading(true);
      
      const professionalData = {
        ...formData,
        // Ensure arrays are initialized
        languages: formData.languages || [],
        expertises: formData.expertises || [],
        topExpertises: (formData.expertises || []).slice(0, 3),
        sessionModes: formData.sessionModes || ['online'],
        qualifications: formData.qualifications || [],
        approaches: formData.approaches || [],
        concernsICanHelp: formData.concernsICanHelp || [],
        reviews: formData.reviews || [],
        faqs: formData.faqs || [],
        articles: formData.articles || [],
        availability: formData.availability || [],
        rating: formData.rating || 5.0,
        reviewCount: formData.reviewCount || 0,
        photo: formData.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
      };

      if (editingProfessional) {
        await apiClient.updateProfessional(editingProfessional.id, professionalData);
        showToast('success', 'Success', 'Professional updated successfully');
      } else {
        await apiClient.createProfessional(professionalData);
        showToast('success', 'Success', 'Professional created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingProfessional(null);
      resetForm();
      loadProfessionals();
    } catch (error) {
      console.error('Failed to save professional:', error);
      showToast('error', 'Error', 'Failed to save professional');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this professional?')) return;
    
    try {
      setLoading(true);
      await apiClient.deleteProfessional(id);
      showToast('success', 'Success', 'Professional deleted successfully');
      loadProfessionals();
    } catch (error) {
      console.error('Failed to delete professional:', error);
      showToast('error', 'Error', 'Failed to delete professional');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      credentials: '',
      category: 'therapist',
      location: '',
      yearsExperience: 0,
      languages: [],
      expertises: [],
      sessionModes: ['online'],
      pricing: { video: 1000, call: 800, chat: 500 },
      bio: '',
      available: true
    });
  };

  const openEditDialog = (professional: Consultant) => {
    setEditingProfessional(professional);
    setFormData(professional);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Consultation Manager</h2>
          <p className="text-muted-foreground">Manage mental health professionals and their profiles.</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProfessional(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Professional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProfessional ? 'Edit Professional' : 'Add New Professional'}</DialogTitle>
                <DialogDescription>
                  Fill in the details for the mental health professional.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Dr. Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credentials</Label>
                    <Input 
                      value={formData.credentials} 
                      onChange={(e) => setFormData({...formData, credentials: e.target.value})}
                      placeholder="Ph.D., Clinical Psychologist"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v: any) => setFormData({...formData, category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="therapist">Therapist</SelectItem>
                        <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                        <SelectItem value="counselor">Counselor</SelectItem>
                        <SelectItem value="family-therapist">Family Therapist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (Years)</Label>
                    <Input 
                      type="number"
                      value={formData.yearsExperience} 
                      onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo URL</Label>
                    <Input 
                      value={formData.photo} 
                      onChange={(e) => setFormData({...formData, photo: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Professional biography..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expertise Areas</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
                    {expertiseCategories.map(exp => (
                      <div key={exp} className="flex items-center gap-2">
                        <Checkbox 
                          id={`exp-${exp}`}
                          checked={formData.expertises?.includes(exp)}
                          onCheckedChange={(checked) => {
                            const current = formData.expertises || [];
                            if (checked) {
                              setFormData({...formData, expertises: [...current, exp]});
                            } else {
                              setFormData({...formData, expertises: current.filter(e => e !== exp)});
                            }
                          }}
                        />
                        <Label htmlFor={`exp-${exp}`} className="text-sm font-normal cursor-pointer">
                          {exp}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pricing (₹)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Video</Label>
                      <Input 
                        type="number"
                        value={formData.pricing?.video} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          pricing: { ...formData.pricing!, video: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Call</Label>
                      <Input 
                        type="number"
                        value={formData.pricing?.call} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          pricing: { ...formData.pricing!, call: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Chat</Label>
                      <Input 
                        type="number"
                        value={formData.pricing?.chat} 
                        onChange={(e) => setFormData({
                          ...formData, 
                          pricing: { ...formData.pricing!, chat: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({...formData, available: checked === true})}
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Professional'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search professionals..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Professionals List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading professionals...</div>
        ) : filteredProfessionals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No professionals found</div>
        ) : (
          filteredProfessionals.map((prof) => (
            <Card key={prof.id} className="overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row items-start gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={prof.photo} alt={prof.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {prof.name}
                        {!prof.available && <Badge variant="secondary">Unavailable</Badge>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{prof.credentials}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(prof)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(prof.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {prof.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {prof.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {prof.yearsExperience} years
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {prof.rating} ({prof.reviewCount})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {prof.topExpertises.map(exp => (
                      <Badge key={exp} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
