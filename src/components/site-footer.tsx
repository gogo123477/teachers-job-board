export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} דרושים למורים
      </div>
    </footer>
  );
}
