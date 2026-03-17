interface SocraticPromptProps {
  question: string;
}

export function SocraticPrompt({ question }: SocraticPromptProps) {
  return (
    <div className="rounded-lg border border-yellow-400/40 bg-yellow-50/10 px-4 py-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="text-lg">🤔</span>
        <div>
          <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">
            Socratic Question
          </p>
          <p className="text-foreground">{question}</p>
        </div>
      </div>
    </div>
  );
}
