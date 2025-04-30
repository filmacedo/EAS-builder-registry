import { Button } from "./button";
import { Callout } from "./callout";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="container mx-auto p-4">
      <Callout
        title="Error"
        variant="error"
        action={
          onRetry ? (
            <Button onClick={onRetry}>Try Again</Button>
          ) : (
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          )
        }
      >
        {error}
      </Callout>
    </div>
  );
}
