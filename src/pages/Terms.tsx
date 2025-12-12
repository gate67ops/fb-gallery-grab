import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this application, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use this service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              This application provides a contact sheet view of your Facebook photos and videos, 
              allowing you to browse, select, download, and share your media content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Facebook Integration</h2>
            <p>
              This application uses Facebook Login and the Facebook Graph API to access your photos 
              and videos. By using this service, you also agree to comply with Facebook&apos;s Terms of Service 
              and Data Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to bypass any security measures</li>
              <li>Not use the service to infringe on the rights of others</li>
              <li>Keep your account credentials secure</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              You retain all ownership rights to your photos and videos. We do not claim any 
              ownership over your content. The application itself and its design are protected 
              by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              This service is provided &quot;as is&quot; without warranties of any kind. We are not liable 
              for any damages arising from the use or inability to use this service, including 
              but not limited to loss of data or unauthorized access to your content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service 
              after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
            <p>
              We may terminate or suspend your access to the service at any time, without prior 
              notice, for conduct that we believe violates these terms or is harmful to other 
              users or the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
