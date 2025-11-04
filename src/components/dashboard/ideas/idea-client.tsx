"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Lightbulb } from "lucide-react";
import { brainstormIdeas } from "@/ai/flows/brainstorm-ideas";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function IdeaClient() {
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleBrainstorm = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Por favor, introduce un prompt para la lluvia de ideas.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await brainstormIdeas({ prompt });
      setIdeas(result.ideas);
    } catch (error) {
      console.error(error);
      toast({
        title: "Fallo en la Lluvia de Ideas con IA",
        description: "No se pudieron generar ideas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-2 mb-4">
            <Label htmlFor="prompt">Prompt de Lluvia de Ideas</Label>
            <Textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="p. ej., 'Una obra de teatro ambientada en una biblioteca después del cierre' o 'Ideas de marketing para un espectáculo familiar'"
            />
          </div>
          <Button onClick={handleBrainstorm} disabled={isLoading} className="w-full">
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? "Generando Ideas..." : "Lluvia de Ideas con IA"}
          </Button>
        </CardContent>
      </Card>
      
      {(isLoading || ideas.length > 0) && (
        <div>
            <h2 className="text-xl font-semibold mb-4 font-headline flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary-foreground" /> Ideas Generadas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                {ideas.map((idea, index) => (
                    <Card key={index} className="p-4 flex items-center">
                        <p className="text-sm">{idea}</p>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
