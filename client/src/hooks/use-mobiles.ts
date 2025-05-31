import { useQuery } from "@tanstack/react-query";
import type { Mobile, User } from "@shared/schema";

interface MobilesFilters {
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
  sellerId?: string;
  limit?: number;
}

export function useMobiles(filters: MobilesFilters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.brand) queryParams.append('brand', filters.brand);
  if (filters.condition) queryParams.append('condition', filters.condition);
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.sellerId) queryParams.append('sellerId', filters.sellerId);

  const queryString = queryParams.toString();
  const url = `/api/mobiles${queryString ? `?${queryString}` : ''}`;

  return useQuery<(Mobile & { seller: User })[]>({
    queryKey: [url],
    select: (data) => {
      // Apply client-side limit if specified
      return filters.limit ? data.slice(0, filters.limit) : data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMobile(id: number) {
  return useQuery<Mobile & { seller: User }>({
    queryKey: [`/api/mobiles/${id}`],
    enabled: !!id,
  });
}

export function useUserMobiles() {
  return useQuery<(Mobile & { seller: User })[]>({
    queryKey: ['/api/user/mobiles'],
  });
}
