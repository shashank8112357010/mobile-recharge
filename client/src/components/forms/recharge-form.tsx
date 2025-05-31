import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRechargeTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRecharge } from "@/hooks/use-recharge";

const rechargeFormSchema = insertRechargeTransactionSchema.extend({
  customAmount: z.string().optional(),
}).omit({ userId: true, transactionId: true });

type RechargeFormData = z.infer<typeof rechargeFormSchema>;

const OPERATORS = [
  { value: "airtel", label: "Airtel", color: "bg-red-500" },
  { value: "jio", label: "Jio", color: "bg-blue-500" },
  { value: "vi", label: "Vi", color: "bg-purple-500" },
  { value: "bsnl", label: "BSNL", color: "bg-green-500" },
];

const RECHARGE_PLANS = [
  {
    amount: "199",
    validity: "28 days",
    data: "1GB/day",
    benefits: "Unlimited calls",
    badge: "Popular",
    badgeColor: "bg-green-100 text-green-600"
  },
  {
    amount: "399",
    validity: "28 days", 
    data: "2.5GB/day",
    benefits: "Unlimited calls + Disney+ Hotstar",
    badge: "Best Value",
    badgeColor: "bg-blue-100 text-blue-600"
  },
  {
    amount: "599",
    validity: "56 days",
    data: "2GB/day", 
    benefits: "Unlimited calls + Netflix",
    badge: "Long Validity",
    badgeColor: "bg-purple-100 text-purple-600"
  }
];

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI",
    icon: "fas fa-mobile-alt",
    description: "Pay via any UPI app",
    badge: "Instant",
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "wallet",
    name: "Wallet",
    icon: "fas fa-wallet", 
    description: "Balance: ₹1,245",
    badge: "₹50 Cashback",
    color: "bg-purple-100 text-purple-600"
  }
];

export default function RechargeForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rechargeHistory } = useRecharge();
  
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");
  const [detectedOperator, setDetectedOperator] = useState<string>("");
  
  const form = useForm<RechargeFormData>({
    resolver: zodResolver(rechargeFormSchema),
    defaultValues: {
      mobileNumber: "",
      operator: "",
      planType: "prepaid",
      amount: "",
      planDetails: {},
      paymentMethod: "upi",
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: RechargeFormData) => {
      const response = await apiRequest('POST', '/api/recharge', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recharge successful!",
        description: "Your mobile has been recharged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge/history'] });
      form.reset();
      setSelectedPlan("");
    },
    onError: (error) => {
      toast({
        title: "Recharge failed",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const detectOperator = (mobileNumber: string) => {
    // Simple operator detection based on number prefixes
    const number = mobileNumber.replace(/\D/g, '');
    if (number.length >= 3) {
      const prefix = number.substring(0, 3);
      if (['701', '702', '703', '704', '705', '706', '707', '708', '709'].includes(prefix)) {
        setDetectedOperator("airtel");
        form.setValue('operator', 'airtel');
      } else if (['899', '898', '897', '896', '895', '894', '893', '892', '891'].includes(prefix)) {
        setDetectedOperator("jio");
        form.setValue('operator', 'jio');
      } else if (['900', '901', '902', '903', '904', '905', '906', '907', '908', '909'].includes(prefix)) {
        setDetectedOperator("vi");
        form.setValue('operator', 'vi');
      } else {
        setDetectedOperator("bsnl");
        form.setValue('operator', 'bsnl');
      }
    }
  };

  const handleMobileNumberChange = (value: string) => {
    form.setValue('mobileNumber', value);
    if (value.length === 10) {
      detectOperator(value);
    }
  };

  const handlePlanSelect = (amount: string) => {
    setSelectedPlan(amount);
    form.setValue('amount', amount);
    const plan = RECHARGE_PLANS.find(p => p.amount === amount);
    if (plan) {
      form.setValue('planDetails', {
        validity: plan.validity,
        data: plan.data,
        benefits: plan.benefits
      });
    }
  };

  const onSubmit = (data: RechargeFormData) => {
    if (!selectedPlan && !data.amount) {
      toast({
        title: "Plan required",
        description: "Please select a plan or enter a custom amount.",
        variant: "destructive",
      });
      return;
    }
    
    rechargeMutation.mutate({
      ...data,
      paymentMethod: selectedPayment,
    });
  };

  return (
    <div className="space-y-6">
      {/* Service Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant="default"
          size="sm"
          className="flex-1 bg-white text-primary shadow-sm"
        >
          Mobile
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
          DTH
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
          Postpaid
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mobile Number */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          +91
                        </span>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          className="pl-12 pr-12"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                            handleMobileNumberChange(value);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          <i className="fas fa-address-book text-primary"></i>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operator Detection */}
              {detectedOperator && (
                <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div>
                    <div className="font-medium text-green-900 capitalize">
                      {OPERATORS.find(op => op.value === detectedOperator)?.label} Detected
                    </div>
                    <div className="text-sm text-green-700">Prepaid • Mumbai</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recharge Plans */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Popular Plans</h4>
              <div className="space-y-3">
                {RECHARGE_PLANS.map((plan) => (
                  <Button
                    key={plan.amount}
                    type="button"
                    variant={selectedPlan === plan.amount ? "default" : "outline"}
                    className="w-full p-4 h-auto justify-between"
                    onClick={() => handlePlanSelect(plan.amount)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">₹{plan.amount}</div>
                      <div className="text-sm opacity-70">
                        {plan.data} • {plan.validity} • {plan.benefits}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={plan.badgeColor}>
                        {plan.badge}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Amount */}
          <Card>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Or Enter Custom Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          if (e.target.value) {
                            setSelectedPlan("");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method.id}
                    type="button"
                    variant={selectedPayment === method.id ? "default" : "outline"}
                    className="w-full p-4 h-auto justify-start"
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.color}`}>
                        <i className={method.icon}></i>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm opacity-70">{method.description}</div>
                      </div>
                      <Badge className="text-green-600">{method.badge}</Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-secondary hover:bg-green-700"
            disabled={rechargeMutation.isPending}
          >
            {rechargeMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : (
              `Recharge ₹${selectedPlan || form.watch('amount') || '0'}`
            )}
          </Button>
        </form>
      </Form>

      {/* Recent Recharges */}
      {rechargeHistory && rechargeHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Recent Recharges</h4>
            <div className="space-y-3">
              {rechargeHistory.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">{transaction.mobileNumber}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      ₹{Number(transaction.amount).toLocaleString()}
                    </div>
                    <Badge
                      variant={transaction.status === 'success' ? 'default' : 'destructive'}
                      className={transaction.status === 'success' ? 'bg-green-100 text-green-600' : ''}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
