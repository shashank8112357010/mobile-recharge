import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Mobile, User } from "@shared/schema";

export default function PendingListings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: pendingMobiles, isLoading, error } = useQuery({
    queryKey: ['/api/admin/pending-mobiles'],
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: async (mobileId: number) => {
      const response = await apiRequest('PUT', `/api/admin/mobiles/${mobileId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing approved",
        description: "The mobile listing has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-mobiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to approve listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (mobileId: number) => {
      const response = await apiRequest('PUT', `/api/admin/mobiles/${mobileId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing rejected",
        description: "The mobile listing has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-mobiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to reject listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (mobileId: number) => {
    approveMutation.mutate(mobileId);
  };

  const handleReject = (mobileId: number) => {
    rejectMutation.mutate(mobileId);
  };

  if (error && isUnauthorizedError(error)) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
        <p className="text-red-600">You need admin access to view this section.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
        <p className="text-red-600">Error loading pending listings. Please try again.</p>
      </div>
    );
  }

  if (!pendingMobiles || pendingMobiles.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-check-circle text-green-500 text-3xl mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
        <p className="text-gray-600">All listings have been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingMobiles.map((mobile: Mobile & { seller: User }) => (
        <Card key={mobile.id} className="border-l-4 border-l-orange-500">
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
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">
                  {mobile.brand} {mobile.model}
                </h4>
                <p className="text-sm text-gray-600">
                  {mobile.storage && `${mobile.storage} • `}
                  {mobile.color} • {mobile.condition}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-gray-900">
                    ₹{Number(mobile.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    By: {mobile.seller.firstName || mobile.seller.email?.split('@')[0] || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {mobile.location}
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(mobile.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(mobile.id)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-times"></i>
                  )}
                </Button>
              </div>
            </div>
            
            {mobile.description && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {mobile.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
