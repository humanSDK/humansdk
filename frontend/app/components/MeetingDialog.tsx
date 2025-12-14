import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// interface MeetingDetails {
//   summary: string;
//   location: string;
//   description: string;
//   start: string;
//   end: string;
//   attendees: string[];
// }

type User = {
  _id: string;
  email: string;
  userName: string;
  userId: string;
  avatar: string;
  status: "accepted" | "removed" | "invited";
};

interface MeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (meetingDetails: Object) => void;
  members: User[];
  assignees: string[];
}

export function MeetingDialog({
  open,
  onClose,
  onSave,
  members,
}: MeetingDialogProps) {
  const [meetingDetails, setMeetingDetails] = useState({
    summary: "",
    location: "",
    description: "",
    start: "2025-01-15T10:00:00-08:00",
    end: "2025-01-15T11:00:00-08:00",
    attendees: members.map((member) => {
      return { email: member.email, name: member.userName };
    }),
  });

  useEffect(() => {
    setMeetingDetails({
      summary: "",
      location: "",
      description: "",
      start: "2025-01-15T10:00:00-08:00",
      end: "2025-01-15T11:00:00-08:00",
      attendees: members.map((member) => {
        return { email: member.email, name: member.userName };
      }),
    });
  },[]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setMeetingDetails((prevDetails) => {
      if (id === "attendees") {
        if (
          meetingDetails.attendees
            .map((member) => member.email)
            .includes(event.target.value)
        )
          return prevDetails;
        else {
          const member = members.find(
            (member) => member.email === event.target.value
          ) || { userName: "" };
          return {
            ...prevDetails,
            [id]: [
              ...prevDetails.attendees,
              { email: event.target.value, name: member.userName },
            ],
          };
        }
      } else
        return {
          ...prevDetails,
          [id]: value,
        };
    });
  };

  const removeGuest=(guest:string)=>{
    setMeetingDetails(prevDetails => ({...prevDetails,attendees:prevDetails.attendees.filter(member=>member.name!==guest)}))
  }

  const saveHandler = (event: React.FormEvent, meetingDetails: Object) => {
    event.preventDefault();
    onSave(meetingDetails);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
          <DialogDescription>
            Fill out the details below to schedule a meeting.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event: React.FormEvent) =>
            saveHandler(event, meetingDetails)
          }
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="summary" className="text-right">
              Summary
            </Label>
            <Input
              required
              id="summary"
              value={meetingDetails.summary}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              required
              id="location"
              value={meetingDetails.location}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              required
              id="description"
              value={meetingDetails.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Start Time
            </Label>
            <Input
              required
              id="start"
              value={meetingDetails.start}
              onChange={handleChange}
              type="datetime-local"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              End Time
            </Label>
            <Input
              required
              id="end"
              value={meetingDetails.end}
              onChange={handleChange}
              type="datetime-local"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="attendees" className="text-right mt-3">
              Attendees
            </Label>
            <div className="col-span-3">
              <div className="flex gap-2 items-center mb-2">
                <select
                  id="attendees"
                  onChange={handleChange}
                  className="flex-1 border rounded p-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select attendee
                  </option>
                  {members.map((member, index) => (
                    <option key={index} value={member.email}>
                      {member.userName}
                    </option>
                  ))}
                </select>
              </div>
              <ul>
                {meetingDetails.attendees.map((member, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center mb-1"
                  >
                    <span>{member.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeGuest(member.name)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
