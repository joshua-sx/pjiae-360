
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  totalEntries: number;
  validEntries: number;
  invalidEntries: number;
}

export default function StatsCards({ totalEntries, validEntries, invalidEntries }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">{totalEntries}</p>
          <p className="text-sm text-slate-600">Total entries</p>
        </CardContent>
      </Card>
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{validEntries}</p>
          <p className="text-sm text-green-600">Valid entries</p>
        </CardContent>
      </Card>
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{invalidEntries}</p>
          <p className="text-sm text-red-600">Entries with errors</p>
        </CardContent>
      </Card>
    </div>
  );
}
