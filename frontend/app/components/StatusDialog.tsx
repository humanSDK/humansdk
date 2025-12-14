"use client";

import { useState } from "react";
import { Calendar, Car, Clock, HomeIcon, SmilePlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/components/context/UserContext';

interface StatusOption {
  icon: React.ReactNode;
  label: string;
  duration: string;
  value: string;
}

const statusOptions: StatusOption[] = [
  {
    icon: <Calendar className="w-4 h-4 text-blue-500" />,
    label: "In a meeting",
    duration: "1 hour",
    value: "in_meeting"
  },
  {
    icon: <Car className="w-4 h-4" />,
    label: "Commuting",
    duration: "30 minutes",
    value: "commuting"
  },
  {
    icon: <SmilePlus className="w-4 h-4 text-yellow-500" />,
    label: "Out sick",
    duration: "Today",
    value: "sick"
  },
  {
    icon: <HomeIcon className="w-4 h-4" />,
    label: "Working remotely",
    duration: "Today",
    value: "remote"
  }
];

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
  onStatusChange?: () => void;
}

export function StatusDialog({ open, onOpenChange, currentStatus, onStatusChange }: StatusDialogProps) {
  const [customStatus, setCustomStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const { toast } = useToast();
  const { updateUserStatus } = useUser();

  const updateStatus = async () => {
    try {
      const status = selectedStatus || customStatus || "active";
      await updateUserStatus(status);
      toast({
        title: "Status updated",
        description: "Your status has been updated successfully"
      });

      if (onStatusChange) {
        onStatusChange();
      }
      onOpenChange(false);
    } catch (error) {
      console.log("Errr:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status"
      });
    }
  };

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value);
    setCustomStatus(""); // Clear custom status when selecting a predefined one
  };

  const handleCustomStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomStatus(e.target.value);
    setSelectedStatus(""); // Clear selected status when typing custom one
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Set a status</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              placeholder="What's your status?"
              value={customStatus}
              onChange={handleCustomStatusChange}
              className="pl-8"
            />
            <SmilePlus className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">For toolpioneers</p>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className={`w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-md ${selectedStatus === option.value ? 'bg-gray-100' : ''
                  }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  {option.duration}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={updateStatus}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
