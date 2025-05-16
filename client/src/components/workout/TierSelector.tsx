import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface TierSelectorProps {
  selectedTier: number;
  onChange: (tier: number) => void;
}

export function TierSelector({ selectedTier, onChange }: TierSelectorProps) {
  // Tier descriptions
  const tierDescriptions = {
    1: "Gentle Start: Safe, steady movements. Ideal for recovery or low energy days.",
    2: "Steady Progress: Moderate challenge. Building consistency and strength.",
    3: "Challenge Phase: Push a little more, improve endurance and function.",
    4: "Full Strength: For confident movers ready for a stronger pace."
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Label htmlFor="tierSelect" className="text-base font-medium">Exercise Level</Label>
          <Select 
            value={selectedTier.toString()} 
            onValueChange={(value) => onChange(Number(value))}
          >
            <SelectTrigger className="w-full" id="tierSelect">
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Tier 1 – Gentle Start</SelectItem>
              <SelectItem value="2">Tier 2 – Steady Progress</SelectItem>
              <SelectItem value="3">Tier 3 – Challenge Phase</SelectItem>
              <SelectItem value="4">Tier 4 – Full Strength</SelectItem>
            </SelectContent>
          </Select>
          
          <p className="text-muted-foreground pt-2">
            {tierDescriptions[selectedTier as keyof typeof tierDescriptions]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}