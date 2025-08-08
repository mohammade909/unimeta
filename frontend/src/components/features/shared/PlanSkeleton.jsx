import  {  memo } from "react";
const PlanSkeleton = memo(() => (
  <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
    <div className="bg-gray-300 h-32"></div>
    <div className="p-8 space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
      </div>
      <div className="h-12 bg-gray-300 rounded-xl w-full"></div>
    </div>
  </div>
));

export default PlanSkeleton