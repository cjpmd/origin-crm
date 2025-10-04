import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function CompanyAvatar({ name, logoUrl, size = "md", className }: CompanyAvatarProps) {
  const getInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={cn("rounded-md", sizeClasses[size], className)}>
      {logoUrl && (
        <AvatarImage src={logoUrl} alt={name} className="object-cover" />
      )}
      <AvatarFallback className="rounded-md bg-primary/10">
        {logoUrl ? (
          <Building2 className={cn("text-primary", iconSizeClasses[size])} />
        ) : (
          <span className="text-xs font-semibold text-primary">{getInitials(name)}</span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
