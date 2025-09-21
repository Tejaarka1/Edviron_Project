import React from "react";

export default function Navbar() {
  return (
    <div className="w-full h-14 bg-white border-b border-gray-200 shadow flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Transactions Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
        <button
          className="text-red-600 hover:text-red-800 text-sm"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
