
import { Users } from "lucide-react";

export default function PeopleHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Add Your People
      </h1>
      <p className="text-lg text-slate-600">
        Import your team members to get started
      </p>
    </div>
  );
}
