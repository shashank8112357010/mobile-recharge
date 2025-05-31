import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMobiles } from "@/hooks/use-mobiles";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "favorites">("listings");
  
  const { data: userMobiles } = useMobiles({ sellerId: user?.id });
  
  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 max-w-md mx-auto">
        <div className="px-4 py-6">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {user.firstName || user.lastName ? 
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                      'User'
                    }
                  </h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star text-xs"></i>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">4.9 (45 reviews)</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <i className="fas fa-edit"></i>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {userMobiles?.filter(m => m.status === 'sold').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {orders?.filter((o: any) => o.buyerId === user.id).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Bought</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {userMobiles?.filter(m => m.status === 'approved').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "listings" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("listings")}
            >
              My Listings
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </Button>
            <Button
              variant={activeTab === "favorites" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab("favorites")}
            >
              Favorites
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === "listings" && (
            <div className="space-y-4">
              {userMobiles && userMobiles.length > 0 ? (
                userMobiles.map((mobile) => (
                  <Card key={mobile.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {mobile.images && mobile.images.length > 0 ? (
                          <img
                            src={mobile.images[0]}
                            alt={`${mobile.brand} ${mobile.model}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i className="fas fa-mobile-alt text-gray-400"></i>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {mobile.brand} {mobile.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {mobile.storage} • {mobile.color}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{Number(mobile.price).toLocaleString()}
                            </span>
                            <Badge
                              variant={
                                mobile.status === 'approved' ? 'default' :
                                mobile.status === 'pending' ? 'secondary' :
                                mobile.status === 'sold' ? 'outline' :
                                'destructive'
                              }
                            >
                              {mobile.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <CardContent>
                    <i className="fas fa-mobile-alt text-gray-400 text-3xl mb-4"></i>
                    <p className="text-gray-500 mb-4">No listings yet</p>
                    <Link href="/sell">
                      <Button>Create Your First Listing</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders && orders.length > 0 ? (
                orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Order #{order.id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{Number(order.amount).toLocaleString()}
                          </span>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <CardContent>
                    <i className="fas fa-shopping-bag text-gray-400 text-3xl mb-4"></i>
                    <p className="text-gray-500">No orders yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-4">
              {favorites && favorites.length > 0 ? (
                favorites.map((favorite: any) => (
                  <Card key={favorite.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {favorite.mobile.images && favorite.mobile.images.length > 0 ? (
                          <img
                            src={favorite.mobile.images[0]}
                            alt={`${favorite.mobile.brand} ${favorite.mobile.model}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i className="fas fa-mobile-alt text-gray-400"></i>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {favorite.mobile.brand} {favorite.mobile.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {favorite.mobile.storage} • {favorite.mobile.color}
                          </p>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{Number(favorite.mobile.price).toLocaleString()}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-heart text-red-500"></i>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <CardContent>
                    <i className="fas fa-heart text-gray-400 text-3xl mb-4"></i>
                    <p className="text-gray-500">No favorites yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Menu Options */}
          <div className="space-y-2 mt-8">
            <Link href="/profile/settings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-cog text-gray-600"></i>
                      </div>
                      <span className="font-medium text-gray-900">Settings</span>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile/help">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-headset text-yellow-600"></i>
                      </div>
                      <span className="font-medium text-gray-900">Help & Support</span>
                    </div>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {user.role === 'admin' && (
              <Link href="/admin">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-shield-alt text-purple-600"></i>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Admin Panel</span>
                          <p className="text-sm text-gray-500">Manage platform</p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full mt-6 text-red-600 border-red-600 hover:bg-red-50"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </main>

      <BottomNav currentPage="profile" />
    </div>
  );
}
