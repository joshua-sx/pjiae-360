import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, X, MousePointer2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppraiserAssignment } from '@/hooks/useAppraiserAssignment';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useToast } from '@/hooks/use-toast';
import AppraiserSelectionModal from './AppraiserSelectionModal';
interface Employee {
  id: string;
  name: string;
  role?: string;
  department?: string;
  division?: string;
  email: string;
  avatar_url?: string;
}
interface AssignAppraisersInlineProps {
  employee: Employee | null;
  appraisalId: string | null;
  assignedAppraisers: any[];
  employees: Employee[];
  onAssignmentComplete: (assignments?: any[]) => void;
}
export default function AssignAppraisersInline({
  employee,
  appraisalId,
  assignedAppraisers,
  employees,
  onAssignmentComplete
}: AssignAppraisersInlineProps) {
  const [primaryAppraiser, setPrimaryAppraiser] = useState<Employee | null>(null);
  const [secondaryAppraiser, setSecondaryAppraiser] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [draggedOverSlot, setDraggedOverSlot] = useState<'primary' | 'secondary' | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    assignAppraisers
  } = useAppraiserAssignment();
  const {
    isDemoMode
  } = useDemoMode();
  const {
    toast
  } = useToast();

  // Create demo employees for demo mode
  const createDemoEmployees = (): Employee[] => [{
    id: 'demo-1',
    name: 'Michael Chen',
    role: 'Manager',
    department: 'Engineering',
    email: 'michael.chen@company.com'
  }, {
    id: 'demo-2',
    name: 'Sarah Johnson',
    role: 'Director',
    department: 'Product',
    email: 'sarah.johnson@company.com'
  }, {
    id: 'demo-3',
    name: 'David Rodriguez',
    role: 'Supervisor',
    department: 'Operations',
    email: 'david.rodriguez@company.com'
  }, {
    id: 'demo-4',
    name: 'Emily Davis',
    role: 'Manager',
    department: 'Marketing',
    email: 'emily.davis@company.com'
  }, {
    id: 'demo-5',
    name: 'James Wilson',
    role: 'Director',
    department: 'Sales',
    email: 'james.wilson@company.com'
  }, {
    id: 'demo-6',
    name: 'Lisa Thompson',
    role: 'Supervisor',
    department: 'HR',
    email: 'lisa.thompson@company.com'
  }];

  // Load employees data
  useEffect(() => {
    if (isDemoMode) {
      const demoEmployees = createDemoEmployees();
      setAllEmployees(demoEmployees);
      // Auto-select current user as primary
      const current = demoEmployees[0];
      setCurrentUser(current);
      setPrimaryAppraiser(current);
    } else {
      setAllEmployees(employees);
      // In real mode, we'd need to get current user from context
    }
  }, [isDemoMode, employees]);

  // Load existing assignments
  useEffect(() => {
    if (assignedAppraisers.length > 0) {
      const primary = assignedAppraisers.find(a => a.is_primary);
      const secondary = assignedAppraisers.find(a => !a.is_primary);
      if (primary) {
        const primaryEmployee = allEmployees.find(e => e.id === primary.appraiser_id);
        setPrimaryAppraiser(primaryEmployee || null);
      }
      if (secondary) {
        const secondaryEmployee = allEmployees.find(e => e.id === secondary.appraiser_id);
        setSecondaryAppraiser(secondaryEmployee || null);
      }
    }
  }, [assignedAppraisers, allEmployees]);

  // Auto-update assignments in demo mode when selections change
  useEffect(() => {
    if (!isDemoMode || !primaryAppraiser) return;
    const draftAssignments = [];
    if (primaryAppraiser) {
      draftAssignments.push({
        appraiser: primaryAppraiser,
        role: 'primary',
        is_primary: true,
        appraiser_id: primaryAppraiser.id
      });
    }
    if (secondaryAppraiser) {
      draftAssignments.push({
        appraiser: secondaryAppraiser,
        role: 'secondary',
        is_primary: false,
        appraiser_id: secondaryAppraiser.id
      });
    }

    // Call onAssignmentComplete with draft assignments to enable "Next" button
    onAssignmentComplete(draftAssignments);
  }, [primaryAppraiser, secondaryAppraiser, isDemoMode, onAssignmentComplete]);

  // Filter eligible appraisers (managers, supervisors, directors)
  const eligibleAppraisers = allEmployees.filter(user => user.role && ['Manager', 'Supervisor', 'Director'].includes(user.role));

  // Available appraisers (excluding already selected ones)
  const availableAppraisers = eligibleAppraisers.filter(user => user.id !== primaryAppraiser?.id && user.id !== secondaryAppraiser?.id);
  const handleUserClick = (user: Employee) => {
    // If secondary slot is empty and primary is filled, auto-assign to secondary
    if (primaryAppraiser && !secondaryAppraiser) {
      setSecondaryAppraiser(user);
      return;
    }

    // If primary slot is empty and secondary is filled, auto-assign to primary
    if (!primaryAppraiser && secondaryAppraiser) {
      setPrimaryAppraiser(user);
      return;
    }

    // If both slots are empty, show modal
    if (!primaryAppraiser && !secondaryAppraiser) {
      setSelectedUser(user);
      setModalOpen(true);
      return;
    }
  };
  const handleModalSelectPrimary = () => {
    if (selectedUser) {
      setPrimaryAppraiser(selectedUser);
      setModalOpen(false);
      setSelectedUser(null);
    }
  };
  const handleModalSelectSecondary = () => {
    if (selectedUser) {
      setSecondaryAppraiser(selectedUser);
      setModalOpen(false);
      setSelectedUser(null);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };
  const handleRemovePrimary = () => {
    setPrimaryAppraiser(null);
  };
  const handleRemoveSecondary = () => {
    setSecondaryAppraiser(null);
  };
  const handleDragStart = (e: React.DragEvent, user: Employee) => {
    console.debug('🔥 Drag start:', user.name);
    setIsDragging(true);

    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';

    // Set data in multiple formats for cross-browser compatibility
    e.dataTransfer.setData('application/json', JSON.stringify(user));
    e.dataTransfer.setData('text/plain', user.id);

    // Create custom drag image for better visual feedback
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-primary text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-medium';
    dragImage.textContent = user.name;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  const handleDragOver = (e: React.DragEvent, slot: 'primary' | 'secondary') => {
    console.debug('🎯 Drag over slot:', slot);
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot(slot);
  };
  const handleDragEnter = (e: React.DragEvent, slot: 'primary' | 'secondary') => {
    console.debug('📥 Drag enter slot:', slot);
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverSlot(slot);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    console.debug('📤 Drag leave');
    // Only clear if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOverSlot(null);
    }
  };
  const handleDragEnd = () => {
    console.debug('🏁 Drag end');
    setDraggedOverSlot(null);
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent, slot: 'primary' | 'secondary') => {
    e.preventDefault();
    e.stopPropagation();
    console.debug('💥 Drop on slot:', slot);
    setDraggedOverSlot(null);
    setIsDragging(false);

    // Try application/json first, fallback to text/plain
    let user: Employee | null = null;
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        user = JSON.parse(jsonData);
      } catch (error) {
        console.warn('❌ Failed to parse JSON drag data:', error);
      }
    }

    // Fallback to text/plain (user ID)
    if (!user) {
      const userId = e.dataTransfer.getData('text/plain');
      if (userId) {
        user = availableAppraisers.find(u => u.id === userId) || null;
      }
    }
    if (user) {
      console.debug('✅ Assigning user to slot:', user.name, slot);
      if (slot === 'primary') {
        setPrimaryAppraiser(user);
      } else {
        setSecondaryAppraiser(user);
      }
      toast({
        title: "Appraiser Assigned",
        description: `${user.name} assigned as ${slot} appraiser`
      });
    } else {
      console.warn('❌ No valid user data found in drop');
    }
  };

  // Long press handlers for touch devices
  const handleLongPressStart = (user: Employee) => {
    const timer = setTimeout(() => {
      console.debug('📱 Long press detected for:', user.name);
      clearTimeout(timer);
      setLongPressTimer(null);

      // Show assignment modal for touch devices
      setSelectedUser(user);
      setModalOpen(true);
    }, 600); // 600ms long press

    setLongPressTimer(timer);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent, user: Employee) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUserClick(user);
    }
  };
  const handleSave = async () => {
    if (!appraisalId) {
      toast({
        title: "Error",
        description: "Appraisal must be started before assigning appraisers.",
        variant: "destructive"
      });
      return;
    }
    if (!primaryAppraiser) {
      toast({
        title: "Error",
        description: "Primary appraiser is required.",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      const appraiserIds = [primaryAppraiser.id];
      if (secondaryAppraiser) {
        appraiserIds.push(secondaryAppraiser.id);
      }
      const assignedBy = currentUser?.id || primaryAppraiser.id;
      const assignments = await assignAppraisers(appraisalId, appraiserIds, assignedBy);
      toast({
        title: "Success",
        description: "Appraisers assigned successfully."
      });

      // Pass the assignments to enable "Next" button in demo mode
      onAssignmentComplete(assignments);
    } catch (error) {
      console.error('Error assigning appraisers:', error);
      toast({
        title: "Error",
        description: "Failed to assign appraisers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  if (!appraisalId) {
    return <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Start the appraisal first to assign appraisers.</p>
      </div>;
  }
  return <div className="space-y-8">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          <span className="font-medium">Instructions:</span> Click on any available appraiser below to assign them, or drag and drop them into the slots above. On mobile devices, long-press an appraiser to open assignment options. Both appraisers can be removed or replaced at any time.
        </p>
      </div>

      {/* Appraiser Slots */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Primary Appraiser */}
        <div className={`bg-card border-2 rounded-xl p-6 transition-all duration-200 ${draggedOverSlot === 'primary' ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'}`} onDragOver={e => handleDragOver(e, 'primary')} onDragEnter={e => handleDragEnter(e, 'primary')} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, 'primary')} aria-dropeffect="move">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Primary Appraiser</h3>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              Required
            </span>
          </div>
          {primaryAppraiser ? <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{primaryAppraiser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {primaryAppraiser.role} • {primaryAppraiser.department}
                </p>
              </div>
              <button onClick={handleRemovePrimary} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10">
                <X className="w-4 h-4" />
              </button>
            </div> : <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
              <MousePointer2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1 font-medium">Drop here or click below</p>
              <p className="text-xs text-muted-foreground">Select primary appraiser from available list</p>
            </div>}
        </div>

        {/* Secondary Appraiser */}
        <div className={`bg-card border-2 rounded-xl p-6 transition-all duration-200 ${draggedOverSlot === 'secondary' ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'}`} onDragOver={e => handleDragOver(e, 'secondary')} onDragEnter={e => handleDragEnter(e, 'secondary')} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, 'secondary')} aria-dropeffect="move">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Secondary Appraiser</h3>
            <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
              Optional
            </span>
          </div>
          {secondaryAppraiser ? <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{secondaryAppraiser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {secondaryAppraiser.role} • {secondaryAppraiser.department}
                </p>
              </div>
              <button onClick={handleRemoveSecondary} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10">
                <X className="w-4 h-4" />
              </button>
            </div> : <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
              <MousePointer2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1 font-medium">Drop here or click below</p>
              <p className="text-xs text-muted-foreground">Select secondary appraiser from available list</p>
            </div>}
        </div>
      </div>

      {/* Available Appraisers */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Available Appraisers</h3>
        {availableAppraisers.length > 0 ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAppraisers.map(user => <motion.div key={user.id} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className={`select-none transition-all duration-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab focus:cursor-grab'}`} onClick={() => handleUserClick(user)} onTouchStart={() => handleLongPressStart(user)} onTouchEnd={handleLongPressEnd} onTouchCancel={handleLongPressEnd} onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, user)} tabIndex={0} role="button" aria-label={`Assign ${user.name} as appraiser. Role: ${user.role}, Department: ${user.department}`}>
                <div className="flex items-center space-x-3 p-4 rounded-lg border bg-background hover:bg-muted/50 hover:border-primary/50 focus:border-primary focus:bg-muted/50 transition-all duration-200 group" draggable onDragStart={(e: React.DragEvent) => handleDragStart(e, user)} onDragEnd={handleDragEnd} aria-grabbed={isDragging ? "true" : "false"}>
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role} • {user.department}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <MousePointer2 className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </motion.div>)}
          </div> : <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">All eligible appraisers have been assigned</p>
          </div>}
      </div>

      {/* Save Button */}
      

      {/* Modal */}
      <AppraiserSelectionModal isOpen={modalOpen} onClose={handleModalClose} user={selectedUser} onSelectPrimary={handleModalSelectPrimary} onSelectSecondary={handleModalSelectSecondary} />
    </div>;
}