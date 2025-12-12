import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-destructive/10">
            <Trash2 className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Data Deletion Request</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">How to Delete Your Data</h2>
            <p>
              We respect your right to control your personal data. You can request deletion of 
              your data from our application at any time using the methods described below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Option 1: Remove Facebook App Access</h2>
            <p>
              The easiest way to remove your data is to revoke our application&apos;s access to your 
              Facebook account:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to your Facebook Settings</li>
              <li>Navigate to &quot;Security and Login&quot; → &quot;Apps and Websites&quot;</li>
              <li>Find our application in the list</li>
              <li>Click &quot;Remove&quot; to revoke access</li>
            </ol>
            <p>
              Once you remove access, we will no longer be able to access your Facebook photos 
              or videos. Any cached data will be automatically deleted.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Option 2: Sign Out and Clear Data</h2>
            <p>
              You can also sign out of the application directly:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open the application</li>
              <li>Click on your profile or settings</li>
              <li>Select &quot;Sign Out&quot;</li>
            </ol>
            <p>
              This will end your session and remove any locally stored preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">What Data We Store</h2>
            <p>For transparency, here is what data we may store:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>User preferences:</strong> Grid layout settings, display preferences</li>
              <li><strong>Authentication tokens:</strong> Temporarily stored for session management</li>
            </ul>
            <p>
              <strong>Important:</strong> We do not permanently store your photos or videos. 
              Media is fetched directly from Facebook each time you use the application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Confirmation</h2>
            <p>
              Upon successful deletion of your data, all your information will be removed from 
              our systems within 24 hours. You may continue to use Facebook independently, and 
              can reconnect to our application at any time by logging in again.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
            <p>
              If you have any questions about data deletion or need assistance, please contact 
              us through the application. We are committed to protecting your privacy and will 
              respond to your request promptly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
