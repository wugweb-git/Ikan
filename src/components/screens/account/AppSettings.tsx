import { PageHero } from '../../ui/PageHero';
import { Card, CardContent } from '../../ui/card';

export function AppSettings() {
  return (
    <div className="space-y-6">
      <PageHero title="App Settings" />
      <Card>
        <CardContent className="p-6">
          <p style={{ color: 'var(--color-text-muted)' }}>Additional app settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}