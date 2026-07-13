// src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, isLoading }) => {
  // If loading, show a skeleton placeholder
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4 
                   cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105">
      {icon && <div className="text-indigo-500">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;