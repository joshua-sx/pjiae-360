
import React from 'react';
import DashboardLayout from '../features/dashboard/DashboardLayout';

const Appraisals = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Appraisals</h1>
          <p className="text-muted-foreground">
            Manage and track employee performance reviews
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Pending Reviews</h3>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Due this month</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Completed</h3>
            <p className="text-2xl font-bold">34</p>
            <p className="text-sm text-muted-foreground">This quarter</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Overdue</h3>
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-muted-foreground">Needs attention</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Appraisals;
