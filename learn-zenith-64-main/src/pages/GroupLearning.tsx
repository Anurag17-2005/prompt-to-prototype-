import { useEffect, useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupLearningApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Users, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Helper: normalize participants to a number and check if user joined
function getParticipantsCount(participants) {
  if (Array.isArray(participants)) return participants.length;
  if (typeof participants === "number") return participants;
  // fallback - try to coerce
  return Number(participants) || 0;
}

export default function GroupLearning() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: "", subject: "" });
  // inside GroupLearning component (TypeScript-friendly)

// loadSessions (replace your existing function)
const loadSessions = async () => {
  try {
    const data = await groupLearningApi.getSessions();

    // Case 1: server returns { upcomingSessions: [...], mySessions: [...] }
    if (data && Array.isArray((data as any).upcomingSessions)) {
      setSessions((data as any).upcomingSessions);
      return;
    }

    // Case 2: server returns array directly
    if (Array.isArray(data)) {
      setSessions(data);
      return;
    }

    // Fallback: empty array
    setSessions([]);
  } catch (error) {
    console.error("Failed to load sessions:", error);
    toast.error("Failed to load group sessions");
    setSessions([]);
  }
};


  const handleCreateRoom = async () => {
    if (!newRoom.title || !newRoom.subject) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await groupLearningApi.createSession({
        title: newRoom.title,
        topic: newRoom.subject,
        scheduledAt: new Date().toISOString(),
        duration: 90,
      });
      toast.success("Room created!");
      setDialogOpen(false);
      setNewRoom({ title: "", subject: "" });
      loadSessions();
    } catch (error) {
      console.error("Create room error:", error);
      toast.error("Failed to create room");
    }
  };

  // If no sessions from API, show the mock fallback (unchanged)
  const mockSessions = [
    {
      id: "1",
      title: "DSA Mastery",
      topic: "Data Structures",
      host: { username: "Alex", avatarUrl: "" },
      participants: 8,
      maxParticipants: 20,
      cards: 45,
    },
    {
      id: "2",
      title: "Physics Prep",
      topic: "Physics",
      host: { username: "Sarah", avatarUrl: "" },
      participants: 5,
      maxParticipants: 15,
      cards: 32,
    },
    {
      id: "3",
      title: "Web Dev Squad",
      topic: "Web Development",
      host: { username: "Mike", avatarUrl: "" },
      participants: 12,
      maxParticipants: 25,
      cards: 78,
    },
  ];

  const displaySessions = (sessions && sessions.length > 0) ? sessions : mockSessions;

  // Optional: if you have auth context you can check current user id to determine isJoined
  // For now we'll treat isJoined as false unless participants array contains a "current user id" field.
  const currentUserId = null; // replace with actual user id from AuthContext if available

  return (
    <PageLayout onFabClick={() => setDialogOpen(true)}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">Home &gt; group-learning</div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Group Learning</h1>
              <p className="text-muted-foreground">
                Collaborate with peers, share flashcards, and learn together
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)}>+ Create Room</Button>
          </div>
        </div>

        {/* Study Rooms Grid */}
        <div className="grid grid-cols-3 gap-6">
          {displaySessions.map((session) => {
            // Normalize participants count
            const participantsCount = getParticipantsCount(session.participants);
            const maxParticipants = session.maxParticipants ?? session.max ?? 0;
            // Determine isJoined (if participants is an array of objects with id)
            let isJoined = false;
            if (Array.isArray(session.participants) && currentUserId) {
              isJoined = session.participants.some((p) => p.id === currentUserId);
            } else {
              // if participants provided as number and there's no user id, default false
              isJoined = !!session.isJoined; // allow backend-provided flag
            }

            const hostUsername = session.host?.username ?? "Unknown";
            const avatarSeed = session.host?.username ?? hostUsername;

            return (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription>{session.topic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {participantsCount}/{maxParticipants} members
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">💳</span>
                    <span>{session.cards ?? session.cardCount ?? "—"} cards</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {hostUsername?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{hostUsername}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        // Simple join simulation: if backend supports joining, call API, else optimistic UI
                        if (isJoined) {
                          toast("You're already in this room");
                        } else {
                          // Best: call an API to join. Backend lacks a join endpoint; we can simulate.
                          toast.success("Joined (simulated)");
                        }
                      }}
                    >
                      {isJoined ? "Joined" : "Join Room"}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => {
                      // share action (copy link)
                      const url = `${window.location.origin}/group-learning/${session.id}`;
                      navigator.clipboard?.writeText(url);
                      toast.success("Link copied to clipboard");
                    }}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Create Room Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Study Room</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Start a collaborative learning space with your peers
              </p>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={newRoom.title}
                  onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                  placeholder="e.g. DSA Mastery"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newRoom.subject}
                  onChange={(e) => setNewRoom({ ...newRoom, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                />
              </div>
              <Button onClick={handleCreateRoom} className="w-full">
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
