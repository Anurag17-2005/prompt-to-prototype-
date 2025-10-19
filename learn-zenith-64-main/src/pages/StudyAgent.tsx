import { useEffect, useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type ChatItem = { role: "user" | "agent"; text: string; id: string };

export default function StudyAgent() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<ChatItem[]>([]);

  useEffect(() => {
    // optionally add a welcome agent message
    setChat([{ id: "welcome", role: "agent", text: "Hi! I'm StudyAgent — ask me anything and I'll explain it like you're 10." }]);
  }, []);

  const sendQuestion = async () => {
    const q = question.trim();
    if (!q) {
      toast.error("Please type a question");
      return;
    }
    const userMessage: ChatItem = { id: String(Date.now()) + "-u", role: "user", text: q };
    setChat((s) => [...s, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const resp = await fetch("/api/agent/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include auth only if your backend requires it:
          // Authorization: `Bearer ${localStorage.getItem("learnboost_token")}`
        },
        body: JSON.stringify({ question: q })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || err.message || "Request failed");
      }

      const data = await resp.json();
      const agentText = data.answer || "Sorry, no answer returned.";
      const agentMessage: ChatItem = { id: String(Date.now()) + "-a", role: "agent", text: agentText };
      setChat((s) => [...s, agentMessage]);
    } catch (err: any) {
      console.error("Agent call failed", err);
      toast.error("Agent failed to respond. Check server logs.");
      const errMsg: ChatItem = { id: String(Date.now()) + "-err", role: "agent", text: "I couldn't get an answer right now — please try again." };
      setChat((s) => [...s, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="p-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Study Agent</h1>
          <p className="text-sm text-muted-foreground">Ask doubts — the Study Agent explains like you're 10 years old.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ask the Study Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-h-[50vh] overflow-auto space-y-3 p-2 border rounded">
                {chat.map((c) => (
                  <div key={c.id} className={c.role === "user" ? "text-right" : "text-left"}>
                    <div className={c.role === "user" ? "inline-block bg-primary/10 px-3 py-2 rounded-lg" : "inline-block bg-muted/5 px-3 py-2 rounded-lg"}>
                      <div className="text-sm whitespace-pre-wrap">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type your question, e.g. What is recursion?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendQuestion(); }}
                />
                <Button onClick={sendQuestion} disabled={loading}>
                  {loading ? "Thinking..." : "Ask"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: be specific or ask for examples — the agent will give a simple explanation and a short practice plan.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
