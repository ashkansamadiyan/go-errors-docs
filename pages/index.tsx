import { Button } from '@/components/ui/button';

// Find the button that's causing the issue, it probably looks something like:
<Button href="/docs/docs/getting-started/introduction">Get Started</Button>

// Replace it with:
<Button href="/docs/getting-started/introduction">Get Started</Button>

export default function HomePage() {
  return (
    <div>
      {/* Your homepage content */}
      <Button href="/docs/getting-started/introduction">Get Started</Button>
      {/* More content */}
    </div>
  );
} 