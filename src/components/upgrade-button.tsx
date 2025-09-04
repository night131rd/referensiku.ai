"use client";

import { useState } from "react";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 15000, // Rp 50,000
          description: "Premium Upgrade",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment creation failed");
      }

      const data = await response.json();

      // Redirect to Midtrans payment page
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Upgrade to Premium
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Unlock unlimited searches and premium features for only Rp 50,000/month.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Premium Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Unlimited searches</li>
              <li>Advanced search filters</li>
              <li>Priority support</li>
              <li>Export results</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? "Processing..." : "Upgrade Now - Rp 50,000"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
