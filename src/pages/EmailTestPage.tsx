import { EmailTestPanel } from '@/components/debug/EmailTestPanel';

export default function EmailTestPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Email System Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test email workflows to ensure they're configured correctly
          </p>
        </div>
        <EmailTestPanel />
      </div>
    </div>
  );
}