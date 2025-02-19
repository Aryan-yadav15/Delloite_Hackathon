"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSupabase } from "@/lib/supabase";
import { useManufacturer } from "@/hooks/useManufacturer";

export default function EmailConfigForm({ onSave, initialData }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    email: initialData?.email || "",
    is_verified: initialData?.is_verified || false,
  });

  const handleVerifyEmail = () => {
    setIsVerifying(true);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI)}&response_type=code&scope=https://mail.google.com/&access_type=offline&prompt=consent&state=${emailConfig.email}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email to track"
              value={emailConfig.email}
              onChange={(e) =>
                setEmailConfig((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
            <Button
              onClick={handleVerifyEmail}
              disabled={!emailConfig.email || isVerifying}
              variant="secondary"
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
