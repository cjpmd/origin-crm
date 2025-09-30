import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Loader2 } from "lucide-react";

interface ResearchTriggerProps {
  companyId?: string;
  sectorId?: string;
  onStart: (depth: "quick" | "standard" | "forensic") => void;
  isLoading?: boolean;
}

export function ResearchTrigger({ companyId, sectorId, onStart, isLoading }: ResearchTriggerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Research
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Run Deep Research
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onStart("quick")}>
          <div>
            <div className="font-medium">Quick Analysis</div>
            <div className="text-xs text-muted-foreground">5-10 minutes, basic insights</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStart("standard")}>
          <div>
            <div className="font-medium">Standard Research</div>
            <div className="text-xs text-muted-foreground">15-30 minutes, comprehensive</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStart("forensic")}>
          <div>
            <div className="font-medium">Forensic Deep Dive</div>
            <div className="text-xs text-muted-foreground">1+ hour, exhaustive analysis</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
