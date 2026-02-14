import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              When you use our application with Facebook Login, we access the following information 
              from your Facebook account:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your Facebook profile information (name, email, profile picture)</li>
              <li>Your Facebook photos and videos that you grant access to</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Display your photos and videos in a contact sheet format</li>
              <li>Enable you to download and share your media</li>
              <li>Provide and improve our services</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Storage</h2>
            <p>
              We do not permanently store your photos or videos on our servers. Media is fetched 
              directly from Facebook when you access the application and is displayed in your browser.
              Your user preferences (such as grid layout settings) may be stored to improve your experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              Your data is only used within the application to provide you with the requested functionality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              All data transmission is encrypted using HTTPS.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Revoke Facebook permissions at any time through your Facebook settings</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:bill.chapin@gate67consulting.com" className="text-primary hover:underline">
                bill.chapin@gate67consulting.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
