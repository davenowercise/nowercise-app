import { useState } from "react";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Constants for filter options
const CANCER_TYPES = [
  "Breast Cancer",
  "Colorectal Cancer",
  "Prostate Cancer",
  "Lung Cancer",
  "Lymphoma",
  "Leukemia",
  "Melanoma",
  "Ovarian Cancer",
  "Pancreatic Cancer",
  "Thyroid Cancer",
  "Other"
];

const TREATMENT_PHASES = [
  "Pre-Treatment",
  "During Treatment",
  "Post-Treatment",
  "Recovery",
  "Maintenance",
  "Remission"
];

const MOVEMENT_TYPES = [
  "Cardio",
  "Strength",
  "Flexibility",
  "Balance",
  "Mobility",
  "Coordination"
];

const BODY_FOCUS = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Core",
  "Back",
  "Arms",
  "Legs",
  "Shoulders",
  "Chest"
];

export interface ExerciseFilters {
  searchTerm: string;
  energyLevel: number[];
  cancerTypes: string[];
  treatmentPhases: string[];
  movementTypes: string[];
  bodyFocus: string[];
  equipment: string[];
}

interface ExerciseFiltersProps {
  filters: ExerciseFilters;
  onFilterChange: (filters: ExerciseFilters) => void;
}

export function ExerciseFilters({ filters, onFilterChange }: ExerciseFiltersProps) {
  const [open, setOpen] = useState(false);
  
  // Helper to update a specific filter
  const updateFilter = (key: keyof ExerciseFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };
  
  // Handle selection of a multi-select filter item
  const toggleArrayFilter = (key: keyof ExerciseFilters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(key, newValues);
  };
  
  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      searchTerm: "",
      energyLevel: [],
      cancerTypes: [],
      treatmentPhases: [],
      movementTypes: [],
      bodyFocus: [],
      equipment: []
    });
  };
  
  // Count active filters (excluding search term)
  const activeFilterCount = [
    filters.energyLevel.length,
    filters.cancerTypes.length,
    filters.treatmentPhases.length,
    filters.movementTypes.length,
    filters.bodyFocus.length,
    filters.equipment.length
  ].reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          className="pl-9"
          value={filters.searchTerm}
          onChange={(e) => updateFilter("searchTerm", e.target.value)}
        />
        {filters.searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => updateFilter("searchTerm", "")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-background" role="combobox">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full px-1 font-normal">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search filters..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {/* Energy Level Filter */}
              <CommandGroup heading="Energy Level">
                <div className="px-3 py-2">
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs">Low Energy</Label>
                    <Label className="text-xs">High Energy</Label>
                  </div>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={filters.energyLevel.length ? filters.energyLevel : [1, 5]}
                    onValueChange={(value) => updateFilter("energyLevel", value)}
                    className="my-2"
                  />
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <span key={level} className="text-xs">{level}</span>
                    ))}
                  </div>
                </div>
              </CommandGroup>
              
              <CommandSeparator />
              
              {/* Cancer Types Filter */}
              <CommandGroup heading="Cancer Types">
                {CANCER_TYPES.map((type) => (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={() => toggleArrayFilter("cancerTypes", type)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        filters.cancerTypes.includes(type) ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}>
                        {filters.cancerTypes.includes(type) && <Check className="h-3 w-3" />}
                      </div>
                      {type}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              {/* Treatment Phases Filter */}
              <CommandGroup heading="Treatment Phases">
                {TREATMENT_PHASES.map((phase) => (
                  <CommandItem
                    key={phase}
                    value={phase}
                    onSelect={() => toggleArrayFilter("treatmentPhases", phase)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        filters.treatmentPhases.includes(phase) ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}>
                        {filters.treatmentPhases.includes(phase) && <Check className="h-3 w-3" />}
                      </div>
                      {phase}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              {/* Movement Types Filter */}
              <CommandGroup heading="Movement Types">
                {MOVEMENT_TYPES.map((type) => (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={() => toggleArrayFilter("movementTypes", type)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        filters.movementTypes.includes(type) ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}>
                        {filters.movementTypes.includes(type) && <Check className="h-3 w-3" />}
                      </div>
                      {type}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              {/* Body Focus Filter */}
              <CommandGroup heading="Body Focus">
                {BODY_FOCUS.map((area) => (
                  <CommandItem
                    key={area}
                    value={area}
                    onSelect={() => toggleArrayFilter("bodyFocus", area)}
                  >
                    <div className="flex items-center">
                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border ${
                        filters.bodyFocus.includes(area) ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}>
                        {filters.bodyFocus.includes(area) && <Check className="h-3 w-3" />}
                      </div>
                      {area}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={clearFilters}
                >
                  Reset Filters
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Lucide icon component
function Search(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}