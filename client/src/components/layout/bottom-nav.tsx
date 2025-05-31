import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentPage?: string;
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (currentPage) {
      return currentPage === path;
    }
    return location === `/${path}` || (path === 'home' && location === '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-5 py-2">
          <Link href="/">
            <button className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              isActive('home') ? "text-primary" : "text-gray-600"
            )}>
              <i className="fas fa-home text-lg mb-1"></i>
              <span className="text-xs font-medium">Home</span>
            </button>
          </Link>

          <Link href="/browse">
            <button className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              isActive('browse') ? "text-primary" : "text-gray-600"
            )}>
              <i className="fas fa-search text-lg mb-1"></i>
              <span className="text-xs">Browse</span>
            </button>
          </Link>

          <Link href="/sell">
            <button className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              isActive('sell') ? "text-primary" : "text-gray-600"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                isActive('sell') ? "bg-primary" : "bg-primary"
              )}>
                <i className="fas fa-plus text-white text-sm"></i>
              </div>
              <span className="text-xs">Sell</span>
            </button>
          </Link>

          <Link href="/recharge">
            <button className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              isActive('recharge') ? "text-primary" : "text-gray-600"
            )}>
              <i className="fas fa-bolt text-lg mb-1"></i>
              <span className="text-xs">Recharge</span>
            </button>
          </Link>

          <Link href="/profile">
            <button className={cn(
              "flex flex-col items-center py-2 px-3 transition-colors",
              isActive('profile') ? "text-primary" : "text-gray-600"
            )}>
              <i className="fas fa-user text-lg mb-1"></i>
              <span className="text-xs">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
