import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMobiles } from "@/hooks/use-mobiles";
import { Link } from "wouter";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { data: featuredMobiles, error } = useMobiles({ status: 'approved', limit: 6 });

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //     return;
  //   }
  // }, [isAuthenticated, isLoading, toast]);

  // useEffect(() => {
  //   if (error && isUnauthorizedError(error)) {
  //     toast({
  //       title: "Unauthorized",
  //       description: "You are logged out. Logging in again...",
  //       variant: "destructive",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/api/login";
  //     }, 500);
  //   }
  // }, [error, toast]);

  // if (isLoading || !isAuthenticated) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 max-w-md mx-auto">
        {/* Welcome Banner */}
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Welcome to Ganpati Traders!</h2>
              <p className="text-blue-100 text-sm mb-4">Buy, Sell & Recharge - All in one place</p>
              <Link href="/sell">
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  Start Selling
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-4 gap-4">
            <Link href="/browse">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-shopping-bag text-primary"></i>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Buy</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sell">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-tag text-secondary"></i>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Sell</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recharge">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-bolt text-purple-600"></i>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Recharge</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-user text-gray-600"></i>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Profile</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Featured Deals */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🔥 Hot Deals</h3>
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </Link>
          </div>
          
          {featuredMobiles && featuredMobiles.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
              {featuredMobiles.slice(0, 3).map((mobile) => (
                <Card key={mobile.id} className="flex-none w-72 shadow-sm">
                  <CardContent className="p-4">
                    {mobile.images && mobile?.images?.length > 0 ? (
                      <img 
                        src={mobile.images[0]} 
                        alt={`${mobile.brand} ${mobile.model}`}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <i className="fas fa-mobile-alt text-gray-400 text-2xl"></i>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={mobile.isNew ? "default" : "secondary"}>
                        {mobile.isNew ? "New" : mobile.condition}
                      </Badge>
                      <div className="flex items-center text-yellow-500">
                        <i className="fas fa-star text-xs"></i>
                        <span className="text-xs text-gray-600 ml-1">4.8</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {mobile.brand} {mobile.model}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {mobile.storage} • {mobile.color}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Number(mobile.price).toLocaleString()}
                      </span>
                      <Button size="sm" className="text-sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-gray-500">No featured deals available at the moment</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories */}
        <div className="px-4 py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Shop by Brand</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/browse?brand=Apple">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <i className="fab fa-apple text-gray-700"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Apple</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?brand=Samsung">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <i className="fab fa-android text-blue-600"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Samsung</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse">
              <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <i className="fas fa-mobile text-orange-600"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Others</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <BottomNav currentPage="home" />
    </div>
  );
}
