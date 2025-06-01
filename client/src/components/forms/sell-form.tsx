import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMobileSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/ui/file-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const sellFormSchema = insertMobileSchema.extend({
  images: z.array(z.string()).min(1, "At least one image is required"),
}).omit({ sellerId: true });

type SellFormData = z.infer<typeof sellFormSchema>;

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Google", "Realme", "Vivo", "Oppo", "Other"];
const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const CONDITIONS = [
  { value: "excellent", label: "Excellent", description: "Like new, no scratches" },
  { value: "good", label: "Good", description: "Minor wear" },
  { value: "fair", label: "Fair", description: "Noticeable wear, works" },
  { value: "poor", label: "Poor", description: "Heavy wear, still working" },
];

export default function SellForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      storage: "",
      color: "",
      condition: "",
      price: "",
      description: "",
      images: [],
      isNew: false,
      location: "",
      specifications: {},
      accessories: [],
    },
  });

  const createMobileMutation = useMutation({
    mutationFn: async (data: SellFormData) => {
      const response = await apiRequest('POST', '/api/mobiles', {
        ...data,
        images: uploadedImages,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing created successfully!",
        description: "Your mobile listing has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/mobiles'] });
      setLocation('/profile');
    },
    onError: (error) => {
      toast({
        title: "Error creating listing",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SellFormData) => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of your mobile.",
        variant: "destructive",
      });
      return;
    }
    
    createMobileMutation.mutate(data);
  };

  const handleImagesUploaded = (urls: string[]) => {
    setUploadedImages(urls);
    form.setValue('images', urls);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <span className="ml-2 text-sm font-medium text-primary">Mobile Info</span>
        </div>
        <div className="flex-1 h-px bg-gray-300"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <span className="ml-2 text-sm text-gray-600">Review</span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANDS.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 14 Pro, Galaxy S23" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select storage" />
                          </SelectTrigger>
                          <SelectContent>
                            {STORAGE_OPTIONS.map((storage) => (
                              <SelectItem key={storage} value={storage}>
                                {storage}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Space Black" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai, Delhi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Condition */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Condition</h3>
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {CONDITIONS.map((condition) => (
                          <Button
                            key={condition.value}
                            type="button"
                            variant={field.value === condition.value ? "default" : "outline"}
                            className="p-4 h-auto text-left justify-start"
                            onClick={() => field.onChange(condition.value)}
                          >
                            <div>
                              <div className="font-medium">{condition.label}</div>
                              <div className="text-xs opacity-70">{condition.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
              <FileUpload
                onFilesUploaded={handleImagesUploaded}
                maxFiles={6}
                acceptedTypes={["image/*"]}
              />
              <p className="text-xs text-gray-500 mt-2">
                📸 Tip: Good photos get 3x more responses!
              </p>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              
              {/* AI Price Suggestion */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-900">AI Price Suggestion</h4>
                  <i className="fas fa-robot text-blue-600"></i>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">₹45,000 - ₹52,000</div>
                <p className="text-sm text-blue-700">Based on model, condition and market trends</p>
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Asking Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="48000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Any accessories included, reason for selling, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold"
            disabled={createMobileMutation.isPending}
          >
            {createMobileMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Listing...
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
