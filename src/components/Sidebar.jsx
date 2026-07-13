// src/components/Sidebar.jsx
import {
  BanknotesIcon,
  Bars3Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LifebuoyIcon,
  MapIcon,
  TruckIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  IdentificationIcon,
  PuzzlePieceIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon },
  { name: 'User Management', href: '/users', icon: UserGroupIcon },
  { name: 'Driver Management', href: '/drivers', icon: IdentificationIcon },

  // Pricing & Zones
  { name: 'Ambulance Types', href: '/ambulance-types', icon: TruckIcon },
  { name: 'Pricing Zones', href: '/zones', icon: MapIcon },
  { name: 'Add-Ons', href: '/addons', icon: PuzzlePieceIcon },
  { name: 'Pricing Settings', href: '/pricing-config', icon: CurrencyDollarIcon },

  { name: 'Travel Management', href: '/travels', icon: MapIcon },

  // Grouped Menus
  {
    name: 'Payments',
    icon: CurrencyDollarIcon,
    children: [
      { name: 'Users', href: '/payments/users', icon: UserIcon },
      { name: 'Drivers', href: '/payments/drivers', icon: TruckIcon },
    ],
  },
  {
    name: 'Wallets',
    icon: BanknotesIcon,
    children: [
      { name: 'Users', href: '/wallet/users', icon: UserIcon },
      { name: 'Drivers', href: '/wallet/drivers', icon: TruckIcon },
    ],
  },
  {
    name: 'Referrals',
    icon: UserPlusIcon,
    children: [
      { name: 'Users', href: '/referral-user', icon: UserIcon },
      { name: 'Drivers', href: '/referral-driver', icon: TruckIcon },
    ],
  },

  { name: 'Support', href: '/support', icon: LifebuoyIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();

  const toggleMenu = name => {
    setOpenMenus(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-4 pb-4">
      {/* Brand + Desktop Toggle */}
      <div className="flex h-16 items-center justify-between text-white">
        {!isCollapsed && <h1 className="text-2xl font-bold">SwiftMed</h1>}

        <button
          className="hidden md:flex p-1 rounded hover:bg-gray-800"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul className="space-y-1">
          {navigation.map(item => {
            const isActive = item.href && location.pathname === item.href;

            // SIMPLE LINK
            if (!item.children) {
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={classNames(
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold',
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            }

            // DROPDOWN GROUP
            const isGroupOpen = openMenus[item.name];

            return (
              <li key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="flex w-full items-center justify-between rounded-md p-2 text-sm font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <div className="flex items-center gap-x-3">
                    <item.icon className="h-6 w-6 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>

                  {!isCollapsed && (
                    <ChevronDownIcon
                      className={classNames(
                        'h-4 w-4 transition-transform',
                        isGroupOpen && 'rotate-180',
                      )}
                    />
                  )}
                </button>

                {!isCollapsed && isGroupOpen && (
                  <ul className="mt-1 ml-9 space-y-1">
                    {item.children.map(child => {
                      const isChildActive = location.pathname === child.href;
                      return (
                        <li key={child.name}>
                          <Link
                            to={child.href}
                            onClick={() => setIsOpen(false)}
                            className={classNames(
                              isChildActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                              'flex items-center gap-x-2 rounded-md px-2 py-1 text-sm',
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-gray-800 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">SwiftMed</h1>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex h-full w-72">{sidebarContent}</div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={classNames(
          'hidden md:flex md:fixed md:inset-y-0 transition-all duration-300',
          isCollapsed ? 'md:w-20' : 'md:w-72',
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
