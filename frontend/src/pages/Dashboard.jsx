import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard"); // adjust baseURL if needed
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Total Transactions</h2>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Success</h2>
          <p className="text-2xl font-bold text-green-600">{stats.success}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Failed</h2>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-semibold">Today Revenue</h2>
          <p className="text-2xl font-bold">₹{stats.todayRevenue || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
