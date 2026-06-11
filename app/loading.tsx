export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <span
          aria-hidden
          className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"
        />
        Carregant…
      </div>
    </div>
  );
}
