import { useQuery } from "@tanstack/react-query";
import type { RechargeTransaction } from "@shared/schema";

export function useRecharge() {
  return useQuery<RechargeTransaction[]>({
    queryKey: ['/api/recharge/history'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRechargeTransaction(id: number) {
  return useQuery<RechargeTransaction>({
    queryKey: [`/api/recharge/${id}`],
    enabled: !!id,
  });
}
