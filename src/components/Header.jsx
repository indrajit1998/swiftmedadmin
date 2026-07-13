// import React from 'react';
// import { useAuth } from '../context/AuthContext';
// import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// const Header = () => {
//   const { logout } = useAuth();

//   return (
//     <header className="bg-white shadow-sm p-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-800">Welcome, Admin!</h1>
//         </div>
//         <div className="flex items-center space-x-4">
//           <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
//             A
//           </div>
//           <button
//             onClick={logout}
//             className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
//             title="Logout"
//           >
//             <ArrowRightOnRectangleIcon className="h-6 w-6" />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  // Get both 'user' and 'logout' from the context
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref for detecting clicks outside the dropdown
  const dropdownRef = useRef(null);

  // Get the first initial of the admin's name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome, {user ? user.name : 'Admin'}!
          </h1>
        </div>

        {/* --- Profile Icon and Dropdown --- */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg"
          >
            {getInitials(user?.name)}
          </button>

          {/* --- Dropdown Menu --- */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
              <div className="py-1">
                {/* Admin Details Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;