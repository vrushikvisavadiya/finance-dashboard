import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function QueryLoader({ query, children }) {
  const { isLoading, isError, error } = query;
  if (isLoading) return <p>Loading…</p>;
  if (isError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Oops</AlertTitle>
        <AlertDescription>
          {error?.message || "Failed to load data"}
        </AlertDescription>
      </Alert>
    );
  return children(query.data);
}
