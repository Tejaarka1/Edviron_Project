import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const isTransactionRoute = location.pathname.startsWith("/dashboard/transactions");
  const [showTransactions, setShowTransactions] = useState(isTransactionRoute);

  // Auto-expand if we’re inside transactions
  useEffect(() => {
    setShowTransactions(isTransactionRoute);
  }, [isTransactionRoute]);

  const baseLink =
    "block px-4 py-2 rounded transition-colors duration-150";
  const activeLink = "bg-gray-700 text-white font-semibold";
  const hoverLink = "hover:bg-gray-600";

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      {/* App name */}
      <h2 className="text-2xl font-bold p-4 border-b border-gray-700">
        Edviron
      </h2>

      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
          }
        >
          Dashboard
        </NavLink>

        {/* Transactions Group */}
        <div>
          <button
            onClick={() => setShowTransactions((prev) => !prev)}
            className={`${baseLink} w-full text-left flex justify-between items-center ${
              isTransactionRoute ? "bg-gray-700 font-semibold" : ""
            } ${hoverLink}`}
          >
            <span>Transactions</span>
            <span className="text-xs">{showTransactions ? "▲" : "▼"}</span>
          </button>

          {showTransactions && (
            <div className="ml-4 mt-1 space-y-1">
              <NavLink
                to="/dashboard/transactions"
                end
                className={({ isActive }) =>
                  `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
                }
              >
                Overview
              </NavLink>
              <NavLink
                to="/dashboard/transactions/school"
                className={({ isActive }) =>
                  `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
                }
              >
                By School
              </NavLink>
              <NavLink
                to="/dashboard/transactions/status"
                className={({ isActive }) =>
                  `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
                }
              >
                Status Check
              </NavLink>
            </div>
          )}
        </div>

        {/* Reports */}
        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) =>
            `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
          }
        >
          Reports
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `${baseLink} ${hoverLink} ${isActive ? activeLink : ""}`
          }
        >
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
