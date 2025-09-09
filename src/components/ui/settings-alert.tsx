import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Settings, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/utils/storage";

const SettingsAlert = () => {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Check if profile is properly filled
    const profile = getUserProfile();

    // Show alert if any required field is empty or default
    const isProfileIncomplete =
      !profile.name ||
      profile.name.trim() === "" ||
      profile.name === "Your Name" ||
      !profile.email ||
      profile.email.trim() === "" ||
      profile.email === "your.email@example.com" ||
      !profile.page ||
      profile.page.trim() === "" ||
      profile.page === "Your Company";

    setShowAlert(isProfileIncomplete);
  }, []);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  if (!showAlert) return null;

  return (
    <Card className="border-warning bg-warning/5 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Complete Your Profile Setup
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Add your name, email, and page information to personalize your content previews and get the best experience.
              </p>
              <Link href="/settings">
                <Button size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground">
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
                </Button>
              </Link>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsAlert;
