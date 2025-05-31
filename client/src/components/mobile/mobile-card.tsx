import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Mobile, User } from "@shared/schema";

interface MobileCardProps {
  mobile: Mobile & { seller: User };
  showFavoriteButton?: boolean;
  isFavorited?: boolean;
}

export default function MobileCard({ mobile, showFavoriteButton = true, isFavorited = false }: MobileCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [favorited, setFavorited] = useState(isFavorited);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (favorited) {
        await apiRequest('DELETE', `/api/favorites/${mobile.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { mobileId: mobile.id });
      }
    },
    onSuccess: () => {
      setFavorited(!favorited);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favorited ? "Removed from favorites" : "Added to favorites",
        description: favorited ? 
          "Mobile removed from your favorites" : 
          "Mobile added to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow relative">
      {/* Offer Badge */}
      {mobile.featured && mobile.offerText && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
          {mobile.offerText}
        </div>
      )}
      
      {/* Discount Badge */}
      {mobile.discountPercentage && mobile.discountPercentage > 0 && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
          {mobile.discountPercentage}% OFF
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex space-x-4">
          {mobile.images && mobile.images.length > 0 ? (
            <img
              src={mobile.images[0]}
              alt={`${mobile.brand} ${mobile.model}`}
              className="w-20 h-20 object-contain rounded-lg flex-shrink-0 bg-gray-50 p-1"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-mobile-alt text-gray-400"></i>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {mobile.brand} {mobile.model}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {mobile.storage && `${mobile.storage} • `}
                  {mobile.color}
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={mobile.isNew ? "default" : "secondary"}>
                    {mobile.isNew ? "New" : mobile.condition}
                  </Badge>
                  {mobile.featured && (
                    <Badge variant="destructive" className="text-xs">
                      FEATURED
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">{mobile.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{Number(mobile.price).toLocaleString()}
                    </span>
                    {mobile.originalPrice && Number(mobile.originalPrice) > Number(mobile.price) && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{Number(mobile.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {showFavoriteButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFavoriteToggle}
                        disabled={favoriteMutation.isPending}
                      >
                        <i className={`fa${favorited ? 's' : 'r'} fa-heart ${favorited ? 'text-red-500' : 'text-gray-400'}`}></i>
                      </Button>
                    )}
                    <Button size="sm" onClick={() => window.location.href = `/mobile/${mobile.id}`}>
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {mobile.seller.firstName?.[0] || mobile.seller.email?.[0] || 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {mobile.seller.firstName || 'Seller'}
            </span>
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 text-xs"></i>
              <span className="text-xs text-gray-500 ml-1">4.8</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
