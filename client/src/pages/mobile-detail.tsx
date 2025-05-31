import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Heart, Share2, MapPin, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function MobileDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: mobile, isLoading } = useQuery({
    queryKey: [`/api/mobiles/${id}`],
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/favorites', { mobileId: Number(id) });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: "Mobile added to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  const handleBuyNow = () => {
    toast({
      title: "Buy Now",
      description: "Contact seller to proceed with purchase",
    });
  };

  const handleShare = () => {
    navigator.share?.({
      title: `${mobile.brand} ${mobile.model}`,
      text: `Check out this ${mobile.brand} ${mobile.model} for ₹${Number(mobile.price).toLocaleString()}`,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!mobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mobile not found</h2>
          <p className="text-gray-600 mb-4">The mobile you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const images = mobile.images && Array.isArray(mobile.images) ? mobile.images : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate mx-4">{mobile.brand} {mobile.model}</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Images */}
      <div className="bg-white">
        {images.length > 0 ? (
          <div className="relative">
            <img
              src={images[currentImageIndex]}
              alt={`${mobile.brand} ${mobile.model}`}
              className="w-full h-80 object-contain bg-gray-50"
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-80 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-mobile-alt text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">{mobile.brand} {mobile.model}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Details */}
      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Price and Offers */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{Number(mobile.price).toLocaleString()}
                  </span>
                  {mobile.originalPrice && Number(mobile.originalPrice) > Number(mobile.price) && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{Number(mobile.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                {mobile.discountPercentage && mobile.discountPercentage > 0 && (
                  <Badge variant="destructive" className="mb-2">
                    {mobile.discountPercentage}% OFF
                  </Badge>
                )}
              </div>
              {mobile.featured && mobile.offerText && (
                <Badge variant="destructive">
                  {mobile.offerText}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {mobile.brand} {mobile.model}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {mobile.storage && <Badge variant="outline">{mobile.storage}</Badge>}
              {mobile.color && <Badge variant="outline">{mobile.color}</Badge>}
              <Badge variant={mobile.isNew ? "default" : "secondary"}>
                {mobile.isNew ? "New" : mobile.condition}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {mobile.location}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(mobile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {mobile.description && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{mobile.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        {mobile.specifications && Object.keys(mobile.specifications).length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(mobile.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessories */}
        {mobile.accessories && Array.isArray(mobile.accessories) && mobile.accessories.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Included Accessories</h3>
              <div className="flex flex-wrap gap-2">
                {mobile.accessories.map((accessory, index) => (
                  <Badge key={index} variant="outline">
                    {String(accessory)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seller Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{mobile.seller?.firstName || 'Seller'}</p>
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-sm text-gray-500 ml-1">4.8 (24 reviews)</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open(`tel:+919876543210`, '_self')}
          >
            Call Seller
          </Button>
          <Button 
            className="flex-1"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>

      {/* Bottom padding for fixed buttons */}
      <div className="h-20"></div>
    </div>
  );
}