import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon } from '../Icon';
import { availableIcons } from '../../components/Icon';
import { Heart, Search, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

export function UIKitElements() {
  return (
    <div className="space-y-8">
        {/* CBT Components */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle>CBT System Components</CardTitle>
          <CardDescription>
            Core interactive elements following the new structural spec.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Buttons */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Primary & Secondary Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button className="cbt-button-primary">
                        Start Program
                    </button>
                    <button className="cbt-button-secondary">
                        Learn More
                    </button>
                    <button className="cbt-button-ghost">
                        Re-check progress
                    </button>
                    <button className="cbt-button-primary">
                        <Heart className="w-5 h-5 mr-2" />
                        With Icon
                    </button>
                </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Form Elements & Inputs</h3>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Standard Input */}
                    <div>
                        <label className="cbt-label">Email Address</label>
                        <input 
                            type="email" 
                            className="cbt-input w-full" 
                            placeholder="name@example.com" 
                        />
                    </div>
                    
                    {/* Dropdown */}
                    <div className="relative">
                        <label className="cbt-label">Select Option</label>
                        <div className="relative">
                            <select className="cbt-input w-full appearance-none cursor-pointer">
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--grey-6)] pointer-events-none" />
                        </div>
                    </div>

                    {/* Error State */}
                    <div>
                        <label className="cbt-label text-red-600">Password</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                className="cbt-input w-full border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500" 
                                placeholder="••••••••"
                                defaultValue="wrongpass"
                            />
                            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                        </div>
                        <p className="mt-1 text-xs text-red-600">Password must be at least 8 characters</p>
                    </div>

                    {/* Success State */}
                    <div>
                        <label className="cbt-label text-green-700">Username</label>
                        <div className="relative">
                             <input 
                                type="text" 
                                className="cbt-input w-full border-green-500 text-green-900 focus:ring-green-500 focus:border-green-500" 
                                defaultValue="johndoe"
                            />
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-xs font-medium text-muted-foreground mb-4">Search Pill (Full Radius)</h4>
                     <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--cbt-placeholder)]" />
                        <input 
                            type="text" 
                            className="cbt-input-pill w-full pl-12" 
                            placeholder="Find the answers..." 
                        />
                    </div>
                </div>
            </div>

            {/* Admin Table */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Admin Data Table (High Density)</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Status</th>
                                <th>Role</th>
                                <th>Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="font-medium">Sarah Johnson</td>
                                <td><span className="badge badge-success">Active</span></td>
                                <td>Admin</td>
                                <td>2 mins ago</td>
                            </tr>
                            <tr>
                                <td>Michael Chen</td>
                                <td><span className="badge badge-warning">Pending</span></td>
                                <td>Editor</td>
                                <td>1 hour ago</td>
                            </tr>
                            <tr>
                                <td>Jessica Davis</td>
                                <td><span className="badge badge-success">Active</span></td>
                                <td>Viewer</td>
                                <td>Yesterday</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Cards & Containers */}
             <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Card Hierarchy</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="cbt-card p-8">
                        <h4 className="card-title mb-4">Main Content Card</h4>
                        <p className="body-text mb-0">
                            Uses 24px radius and 1px border. Designed for the primary "safe space" container.
                        </p>
                    </div>
                    
                    <div className="cbt-card-small p-6">
                        <div className="flex justify-between items-start mb-4">
                             <h4 className="font-medium text-[var(--grey-8)]">History Card</h4>
                             <span className="badge badge-success">Completed</span>
                        </div>
                        <p className="caption-text">
                            Uses 20px radius. Nested content or history items.
                        </p>
                    </div>
                </div>
            </div>

            {/* Instruction Box */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Instruction Box</h3>
                <div className="cbt-instruction-box p-6 max-w-xl">
                    <h5 className="font-medium mb-2 text-[var(--grey-9)]">Your responses suggest...</h5>
                    <p className="text-sm text-[var(--grey-6)]">
                        This box uses Step 1 background (#F5F5F5) with a Step 3 border (#D9D9D9) and 16px radius.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Badges / Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Status Tags</CardTitle>
          <CardDescription>
            Used for status indicators, categories, and labels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <span className="badge badge-success">Active</span>
            <span className="badge badge-warning">Pending</span>
            <span className="badge" style={{ backgroundColor: 'var(--grey-2)', color: 'var(--grey-8)' }}>Neutral</span>
          </div>
        </CardContent>
      </Card>

      {/* Icons */}
      <Card>
        <CardHeader>
          <CardTitle>System Icons</CardTitle>
          <CardDescription>
            Lucide React icons mapped to semantic names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {availableIcons.map((iconName) => (
              <div key={iconName} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <Icon name={iconName} size={24} className="mb-2" />
                <span className="text-xs text-muted-foreground text-center break-all">{iconName}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}