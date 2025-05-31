export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
        <p className="text-xs mt-2">Experience Luxury, Redefined.</p>
      </div>
    </footer>
  );
}
