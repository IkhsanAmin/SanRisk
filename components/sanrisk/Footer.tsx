export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-medium text-foreground">SanRisk</p>
            <p className="text-xs text-muted-foreground">
              Trade Smarter. Manage Risk Better.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 SanRisk. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
