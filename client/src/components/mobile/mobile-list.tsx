import MobileCard from "./mobile-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Mobile, User } from "@shared/schema";

interface MobileListProps {
  mobiles: (Mobile & { seller: User })[];
  showFavoriteButton?: boolean;
}

export default function MobileList({ mobiles, showFavoriteButton = true }: MobileListProps) {
  if (!mobiles || mobiles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <i className="fas fa-mobile-alt text-gray-400 text-3xl mb-4"></i>
          <p className="text-gray-500">No mobiles found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mobiles.map((mobile) => (
        <MobileCard
          key={mobile.id}
          mobile={mobile}
          showFavoriteButton={showFavoriteButton}
        />
      ))}
    </div>
  );
}
