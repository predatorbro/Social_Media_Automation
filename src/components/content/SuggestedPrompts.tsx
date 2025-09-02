import { Button } from "@/components/ui/button";

interface SuggestedPromptsProps {
  onPromptSelect: (prompt: string) => void;
  prompts?: string[];
}

const SuggestedPrompts = ({ onPromptSelect, prompts: customPrompts }: SuggestedPromptsProps) => {
  const defaultPrompts = [
    "Announce a new product launch",
    "Share behind-the-scenes content", 
    "Create motivational Monday post",
    "Promote upcoming event",
    "Share customer success story",
    "Discuss industry trends",
    "Weekend lifestyle content",
    "Announce collaboration"
  ];

  const prompts = customPrompts || defaultPrompts;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Suggested Prompts
      </h3>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onPromptSelect(prompt)}
            className="text-xs hover:scale-105 transition-transform duration-200 hover:border-primary hover:text-primary"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;