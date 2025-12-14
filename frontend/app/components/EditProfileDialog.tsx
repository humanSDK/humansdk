import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenSquare } from "lucide-react";
import { useUser } from "./../components/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import axiosInstances from "@/utils/axiosInstance";
export function EditProfileDialog() {
  const { userData, updateUserProfile } = useUser(); // Access user data and profile update function
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    name: userData.user.name || "",
    timezone: userData.preferences.localTime || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editValues.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Make API call to update the profile
      await axiosInstances.UserService.put(
        `/users/profile`,
        {
          name: editValues.name,
          localTime: editValues.timezone,
        }
      );

      // Update context state
      await updateUserProfile({
        user: {
          ...userData.user,
          name: editValues.name,
        },
        preferences: {
          ...userData.preferences,
          localTime: editValues.timezone,
        },
      });

      toast({
        title: "Success",
        description: "Profile information updated successfully",
      });
      setOpen(false); // Close the dialog

    } catch (err) {
      console.error("Failed to update profile:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile information. Please try again.",
      });
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 hover:bg-muted"
        >
          <PenSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editValues.name}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={editValues.timezone}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, timezone: e.target.value }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Enter your preferred timezone (e.g., UTC, GMT).
            </p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
