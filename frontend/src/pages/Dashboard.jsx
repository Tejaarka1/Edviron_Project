// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [kpis, setKpis] = useState({
    total: 0,
    success: 0,
    failed: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        // ✅ fetch all transactions (or you can paginate if dataset is huge)
        const res = await axiosClient.get("/transactions", { params: { limit: 1000 } });
        const txns = res.data.data || [];

        // ✅ calculate KPIs
        const total = txns.length;
        const success = txns.filter((t) => t.status === "success").length;
        const failed = txns.filter((t) => t.status === "failed").length;

        // today’s revenue = sum of transaction_amount for today’s successful transactions
        const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
        const todayRevenue = txns
          .filter((t) => t.status === "success" && t.payment_time?.slice(0, 10) === today)
          .reduce((sum, t) => sum + (t.transaction_amount || 0), 0);

        setKpis({ total, success, failed, todayRevenue });
      } catch (err) {
        console.error("Error fetching dashboard KPIs:", err);
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
