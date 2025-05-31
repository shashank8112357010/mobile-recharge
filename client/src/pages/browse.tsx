import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import MobileList from "@/components/mobile/mobile-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMobiles } from "@/hooks/use-mobiles";

const filters = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Used", value: "used" },
  { label: "iPhone", value: "Apple" },
  { label: "Samsung", value: "Samsung" },
  { label: "Under ₹20K", value: "under20k" },
];

export default function Browse() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const [searchQuery, setSearchQuery] = useState(params.get('search') || "");
  const [selectedBrand, setSelectedBrand] = useState(params.get('brand') || "");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: mobiles, isLoading, error } = useMobiles({
    status: 'approved',
    search: searchQuery,
    brand: selectedBrand,
    condition: selectedCondition,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
  });

  const handleFilterChange = (filterValue: string) => {
    if (filterValue === "new" || filterValue === "used") {
      setSelectedCondition(filterValue === "new" ? "excellent" : "good");
      setSelectedBrand("");
    } else if (filterValue === "under20k") {
      setPriceRange({ min: "", max: "20000" });
      setSelectedBrand("");
      setSelectedCondition("");
    } else if (filterValue === "Apple" || filterValue === "Samsung") {
      setSelectedBrand(filterValue);
      setSelectedCondition("");
      setPriceRange({ min: "", max: "" });
    } else {
      setSelectedBrand("");
      setSelectedCondition("");
      setPriceRange({ min: "", max: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16 pb-20 max-w-md mx-auto">
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Browse Mobiles</h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search mobiles, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Filter Chips */}
          <div className="flex space-x-3 mb-6 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => {
              const isActive = 
                (filter.value === "" && !selectedBrand && !selectedCondition && !priceRange.max) ||
                filter.value === selectedBrand ||
                (filter.value === "new" && selectedCondition === "excellent") ||
                (filter.value === "used" && selectedCondition === "good") ||
                (filter.value === "under20k" && priceRange.max === "20000");
              
              return (
                <Badge
                  key={filter.label}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => handleFilterChange(filter.value)}
                >
                  {filter.label}
                </Badge>
              );
            })}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-600">
              {mobiles ? `${mobiles.length} results` : "Loading..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="fas fa-filter mr-2"></i>
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg border mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹)
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <div className="flex flex-wrap gap-2">
                  {["excellent", "good", "fair"].map((condition) => (
                    <Badge
                      key={condition}
                      variant={selectedCondition === condition ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setSelectedCondition(selectedCondition === condition ? "" : condition)}
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBrand("");
                  setSelectedCondition("");
                  setPriceRange({ min: "", max: "" });
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Mobile List */}
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading mobiles. Please try again.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MobileList mobiles={mobiles || []} />
          )}
        </div>
      </main>

      <BottomNav currentPage="browse" />
    </div>
  );
}
