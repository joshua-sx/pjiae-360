import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { Search, UserPlus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions, type AppRole } from '@/hooks/usePermissions';
import { RoleAssignmentDialog } from './RoleAssignmentDialog';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  job_title?: string;
  current_roles?: AppRole[];
}

export default function RoleManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  
  const { canManageEmployees } = usePermissions();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch employees with their roles and profile data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employee_info')
        .select(`
          id,
          job_title,
          user_id,
          profiles(
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'active');

      if (employeeError) throw employeeError;

      // Fetch roles for each employee
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (roleError) throw roleError;

      // Combine employee data with roles
      const employeesWithRoles = employeeData.map(emp => ({
        id: emp.id,
        name: `${emp.profiles?.first_name || ''} ${emp.profiles?.last_name || ''}`.trim() || emp.profiles?.email || 'Unknown',
        email: emp.profiles?.email || '',
        job_title: emp.job_title,
        current_roles: roleData
          .filter(role => role.user_id === emp.user_id)
          .map(role => role.role as AppRole)
      }));

      setEmployees(employeesWithRoles);
      setFilteredEmployees(employeesWithRoles);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canManageEmployees) {
      navigate('/unauthorized');
      return;
    }
    fetchEmployees();
  }, [canManageEmployees, navigate]);

  useEffect(() => {
    const filtered = employees.filter(emp =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.current_roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleAssignRole = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowAssignDialog(true);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'job_title',
      header: 'Job Title',
      cell: ({ row }: any) => row.original.job_title || 'Not specified',
    },
    {
      accessorKey: 'current_roles',
      header: 'Current Roles',
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.current_roles?.length > 0 ? (
            row.original.current_roles.map((role: AppRole) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No roles assigned</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAssignRole(row.original)}
          className="h-8"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Assign Role
        </Button>
      ),
    },
  ];

  if (!canManageEmployees) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/roles')}
          className="h-9 w-9 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Role Management"
          description="Assign and manage user roles across your organization"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Roles</CardTitle>
          <CardDescription>
            Manage role assignments for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees by name, email, job title, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <DataTable
              columns={columns}
              data={filteredEmployees}
            />
          </div>
        </CardContent>
      </Card>

      <RoleAssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}