import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

export interface FilterState {
    category: string;
    priceRange: string; // Under ₹50, ₹50-₹200, ₹200-₹500, ₹500+
    community: string;
    rating: string;
    sortBy: string;
}

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        category: "all",
        priceRange: "all",
        community: "all",
        rating: "all",
        sortBy: "newest",
    });

    // Local state for mobile drawer before applying
    const [mobileFilters, setMobileFilters] = useState<FilterState>(filters);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleFilterChange = (key: keyof FilterState, value: string, applyImmediately = true) => {
        if (applyImmediately) {
            const newFilters = { ...filters, [key]: value };
            setFilters(newFilters);
            onFilterChange(newFilters);
        } else {
            setMobileFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const applyMobileFilters = () => {
        setFilters(mobileFilters);
        onFilterChange(mobileFilters);
        setIsOpen(false);
    };

    const clearFilters = (applyImmediately = true) => {
        const defaultFilters: FilterState = {
            category: "all",
            priceRange: "all",
            community: "all",
            rating: "all",
            sortBy: "newest",
        };
        if (applyImmediately) {
            setFilters(defaultFilters);
            onFilterChange(defaultFilters);
        } else {
            setMobileFilters(defaultFilters);
        }
    };

    const hasActiveFilters = (f: FilterState) => Object.entries(f).some(([key, val]) => {
        if (key === "sortBy") return val !== "newest";
        return val !== "all";
    });

    const FilterControls = ({ state, onChange, isMobileView }: { state: FilterState, onChange: (k: keyof FilterState, v: string) => void, isMobileView?: boolean }) => (
        <div className={`flex ${isMobileView ? 'flex-col' : 'flex-wrap items-center'} gap-4 w-full`}>
            {/* Category */}
            <div className={isMobileView ? "space-y-2" : ""}>
                {isMobileView && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>}
                <Select value={state.category} onValueChange={(val) => onChange("category", val)}>
                    <SelectTrigger className={`${isMobileView ? 'w-full' : 'w-[140px]'} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 ${state.category !== "all" ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}>
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Price Range */}
            <div className={isMobileView ? "space-y-2" : ""}>
                {isMobileView && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Price Range</label>}
                <Select value={state.priceRange} onValueChange={(val) => onChange("priceRange", val)}>
                    <SelectTrigger className={`${isMobileView ? 'w-full' : 'w-[140px]'} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 ${state.priceRange !== "all" ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}>
                        <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl">
                        <SelectItem value="all">Any Price</SelectItem>
                        <SelectItem value="under-50">Under ₹50</SelectItem>
                        <SelectItem value="50-200">₹50 - ₹200</SelectItem>
                        <SelectItem value="200-500">₹200 - ₹500</SelectItem>
                        <SelectItem value="500-plus">₹500+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Rating */}
            <div className={isMobileView ? "space-y-2" : ""}>
                {isMobileView && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rating</label>}
                <Select value={state.rating} onValueChange={(val) => onChange("rating", val)}>
                    <SelectTrigger className={`${isMobileView ? 'w-full' : 'w-[130px]'} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 ${state.rating !== "all" ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}>
                        <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl">
                        <SelectItem value="all">Any Rating</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4">4.0+ Stars</SelectItem>
                        <SelectItem value="3">3.0+ Stars</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {!isMobileView && <div className="flex-1" />}

            {/* Sort */}
            <div className={`${isMobileView ? 'space-y-2 pt-4 border-t border-white/10 mt-2' : 'flex items-center gap-3'}`}>
                {isMobileView && <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sort By</label>}
                <Select value={state.sortBy} onValueChange={(val) => onChange("sortBy", val)}>
                    <SelectTrigger className={`group ${isMobileView ? 'w-full' : 'w-[140px]'} backdrop-blur-md transition-all duration-300 h-10 rounded-lg border px-4 focus:ring-0 shadow-none ${state.sortBy !== "newest" ? "bg-white/10 border-white/30 text-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white"}`}>
                        <Filter className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl shadow-2xl align-end">
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                </Select>

                {!isMobileView && hasActiveFilters(state) && (
                    <button
                        onClick={() => clearFilters(true)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full pb-1">
            {/* Desktop View */}
            <div className="hidden md:block">
                <FilterControls state={filters} onChange={(k, v) => handleFilterChange(k, v, true)} />
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <div className="flex items-center justify-between w-full">
                    {/* Sort Dropdown as a quick action on mobile */}
                    <Select value={filters.sortBy} onValueChange={(val) => handleFilterChange("sortBy", val, true)}>
                        <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white rounded-lg">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-white/10 text-white rounded-xl">
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open);
                        if (open) setMobileFilters(filters);
                    }}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="h-10 bg-white/5 border-white/10 text-white hover:bg-white/10 relative">
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                Filters
                                {hasActiveFilters(filters) && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-[#0a0a0a] border-t-white/10 text-white rounded-t-[2rem] max-h-[85vh] overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-white text-xl font-bold">Filters</SheetTitle>
                                    {hasActiveFilters(mobileFilters) && (
                                        <button 
                                            onClick={() => clearFilters(false)}
                                            className="text-sm font-semibold text-zinc-400 hover:text-white"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </SheetHeader>
                            
                            <div className="pb-24">
                                <FilterControls 
                                    state={mobileFilters} 
                                    onChange={(k, v) => handleFilterChange(k, v, false)} 
                                    isMobileView 
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10">
                                <Button 
                                    onClick={applyMobileFilters}
                                    className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold h-12 rounded-xl text-base"
                                >
                                    Show Results
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );
}
