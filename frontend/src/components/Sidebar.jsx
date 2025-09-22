// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  List,
  BookOpen,
  CheckCircle,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState("Transactions");

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutGrid size={18} />,
    },
    {
      name: "Transactions",
      icon: <List size={18} />,
      children: [
        {
          name: "Overview",
          path: "/dashboard/transactions",
          icon: <List size={16} />,
        },
        {
          name: "By School",
          path: "/dashboard/transactions/school",
          icon: <BookOpen size={16} />,
        },
        {
          name: "Status Check",
          path: "/dashboard/transactions/status",
          icon: <CheckCircle size={16} />,
        },
      ],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 size={18} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-screen bg-gray-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <h2 className="text-2xl font-bold">Edviron</h2>}
        <button onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.name} className="mb-2">
            {item.children ? (
              <div>
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.name ? "" : item.name)
                  }
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition ${
                    openMenu === item.name && !collapsed
                      ? "bg-gray-800 font-semibold"
                      : ""
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                  {!collapsed && (
                    <span className="ml-auto">
                      {openMenu === item.name ? "▲" : "▼"}
                    </span>
                  )}
                </button>

                {/* ✅ Only show submenu when NOT collapsed */}
                {openMenu === item.name && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end={child.name === "Overview"}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition ${
                            isActive ? "bg-gray-700 font-semibold" : ""
                          }`
                        }
                      >
                        {child.icon}
                        <span className="ml-2">{child.name}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition ${
                    isActive ? "bg-gray-700 font-semibold" : ""
                  }`
                }
              >
                {item.icon}
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
