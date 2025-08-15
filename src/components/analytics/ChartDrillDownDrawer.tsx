import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, ImageIcon, Share, X } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useAppraisals } from "@/hooks/useAppraisals";
import { DataTable } from "@/components/ui/data-table";
import { MobileCardView } from "@/components/ui/mobile-card-view";
import { exportToCSV, exportChartToPNG } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export interface DrillDownFilter {
  status?: string;
  departmentId?: string;
  divisionId?: string;
  month?: string;
  employeeId?: string;
  cycleId?: string;
  dateRange?: { from: Date; to: Date };
}

interface ChartDrillDownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: "goals" | "appraisals";
  title: string;
  filter: DrillDownFilter;
}

export const ChartDrillDownDrawer = ({ 
  open, 
  onOpenChange, 
  source, 
  title, 
  filter 
}: ChartDrillDownDrawerProps) => {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const drawerRef = React.useRef<HTMLDivElement>(null);

  // Fetch data based on source and filter
  const { goals, loading: goalsLoading } = useGoals();
  const { data: appraisals, isLoading: appraisalsLoading } = useAppraisals();

  const data = source === "goals" ? goals : appraisals;
  const isLoading = source === "goals" ? goalsLoading : appraisalsLoading;

  // Filter data based on drill-down filter
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    
    return data.filter((item: any) => {
      if (filter.status && item.status !== filter.status) return false;
      if (filter.departmentId && item.department_id !== filter.departmentId) return false;
      if (filter.divisionId && item.division_id !== filter.divisionId) return false;
      if (filter.employeeId && item.employee_id !== filter.employeeId) return false;
      if (filter.cycleId && item.cycle_id !== filter.cycleId) return false;
      
      if (filter.month && item.created_at) {
        const itemMonth = new Date(item.created_at).toISOString().slice(0, 7);
        if (itemMonth !== filter.month) return false;
      }
      
      if (filter.dateRange) {
        const itemDate = new Date(item.created_at);
        if (itemDate < filter.dateRange.from || itemDate > filter.dateRange.to) return false;
      }
      
      return true;
    });
  }, [data, filter]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    
    const csvData = filteredData.map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      status: item.status,
      employee: item.employee?.name || item.employee_name,
      department: item.department?.name || item.department_name,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
    
    exportToCSV(csvData, `${source}-${title.toLowerCase().replace(/\s+/g, '-')}.csv`);
    toast({
      title: "Export Successful",
      description: `${source} data exported to CSV`,
    });
  };

  const handleExportPNG = async () => {
    if (!drawerRef.current) return;
    
    try {
      await exportChartToPNG(drawerRef.current, `${source}-${title.toLowerCase().replace(/\s+/g, '-')}.png`);
      toast({
        title: "Export Successful",
        description: "Chart exported as PNG",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export chart as PNG",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('drilldown', JSON.stringify({ source, filter, title }));
    
    navigator.clipboard.writeText(url.toString());
    toast({
      title: "Link Copied",
      description: "Drill-down view link copied to clipboard",
    });
  };

  // Define columns based on source
  const columns = React.useMemo(() => {
    if (source === "goals") {
      return [
        { accessorKey: "title", header: "Goal Title" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "employee.name", header: "Employee" },
        { accessorKey: "department.name", header: "Department" },
        { accessorKey: "due_date", header: "Due Date" },
      ];
    } else {
      return [
        { accessorKey: "title", header: "Appraisal Title" },
        { accessorKey: "status", header: "Status" },
        { accessorKey: "employee.name", header: "Employee" },
        { accessorKey: "department.name", header: "Department" },
        { accessorKey: "rating", header: "Rating" },
      ];
    }
  }, [source]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[800px] w-full" ref={drawerRef}>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>
                Detailed view of {filteredData.length} {source} records
              </SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!filteredData.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPNG}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {source} found matching the selected criteria
            </div>
          ) : (
            <>
              {isMobile ? (
                <MobileCardView
                  data={filteredData}
                  renderCard={(item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-medium">{item.title || item.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <p>Status: {item.status}</p>
                        <p>Employee: {item.employee?.name || item.employee_name}</p>
                        <p>Department: {item.department?.name || item.department_name}</p>
                        {source === "goals" && item.due_date && (
                          <p>Due: {new Date(item.due_date).toLocaleDateString()}</p>
                        )}
                        {source === "appraisals" && item.rating && (
                          <p>Rating: {item.rating}/5</p>
                        )}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredData}
                  className="border-0"
                />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};