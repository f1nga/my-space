"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error a la ruta:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[rgba(244,63,94,0.12)] text-[var(--color-danger)]">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Hi ha hagut un problema</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {error.message || "Quelcom no ha anat com esperavem."}
        </p>
      </div>
      <Button onClick={reset} variant="secondary" size="sm">
        Torna-ho a provar
      </Button>
    </div>
  );
}
