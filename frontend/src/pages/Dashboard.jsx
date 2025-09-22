import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [kpis, setKpis] = useState({ total: 0, success: 0, failed: 0, todayRevenue: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("/transactions", { params: { limit: 1 } });
        setKpis({
          total: res.total || 0,
          success: 0,
          failed: 0,
          todayRevenue: 0,
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded shadow">
          <div>Total Transactions</div>
          <div className="text-xl font-bold">{kpis.total}</div>
        </div>
        <div className="p-4 border rounded shadow">
          <div>Success</div>
          <div className="text-xl font-bold text-green-600">{kpis.success}</div>
        </div>
        <div className="p-4 border rounded shadow">
          <div>Failed</div>
          <div className="text-xl font-bold text-red-600">{kpis.failed}</div>
        </div>
        <div className="p-4 border rounded shadow">
          <div>Today Revenue</div>
          <div className="text-xl font-bold">₹{kpis.todayRevenue}</div>
        </div>
      </div>

      {/* Link to Transactions */}
      <div className="mt-6">
        <Link to="/dashboard/transactions" className="text-blue-600 underline">
          Open Transactions Table →
        </Link>
      </div>
    </div>
  );
}