import { useEffect, useState } from "react";
import { PageLayout } from "@/components/Layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { knowledgeGapsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Zap, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function KnowledgeGaps() {
  const [gaps, setGaps] = useState<any[]>([]);

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      const data = await knowledgeGapsApi.get();
      setGaps(data.gaps || []);
    } catch (error) {
      console.error("Failed to load knowledge gaps:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 60) return "text-destructive";
    if (score < 70) return "text-warning";
    return "text-muted-foreground";
  };

  const mockGaps = [
    {
      topic: "Dynamic Programming",
      score: 52,
      analysis: "Struggling with memoization patterns",
    },
    {
      topic: "Electromagnetism",
      score: 61,
      analysis: "Weak on Faraday's law applications",
    },
    {
      topic: "Statistical Inference",
      score: 58,
      analysis: "Hypothesis testing concepts unclear",
    },
    {
      topic: "Essay Structure",
      score: 65,
      analysis: "Thesis statement formation needs work",
    },
  ];

  const displayGaps = gaps.length > 0 ? gaps : mockGaps;

  return (
    <PageLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">Home &gt; Knowledge Gaps</div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Gaps</h1>
          <p className="text-muted-foreground">
            AI-detected weak areas based on your quiz performance
          </p>
        </div>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Weak Topics (AI Detected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Score %</TableHead>
                  <TableHead>AI Analysis</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayGaps.map((gap, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{gap.topic}</TableCell>
                    <TableCell className={getScoreColor(gap.score || gap.confidenceScore)}>
                      {gap.score || gap.confidenceScore}%
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {gap.analysis || "Needs review"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" className="gap-2">
                        <Zap className="w-4 h-4" />
                        Generate Revision
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
