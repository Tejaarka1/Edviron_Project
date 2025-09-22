// src/pages/StatusCheck.jsx
import React, { useState } from "react";
import { checkTransactionStatus } from "../api/transactionApi";

export default function StatusCheck() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await checkTransactionStatus(query);
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult({ error: "Transaction not found or API error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold mb-4">Transaction Status Check</h1>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Enter Order ID or Collect ID" className="border rounded px-3 py-2 w-80" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button onClick={handleCheck} className="px-4 py-2 bg-blue-600 text-white rounded">
          Check
        </button>
      </div>

      {loading && <p>Checking...</p>}

      {result && (
        <div className="p-4 border rounded shadow bg-gray-50">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p>
                <b>Status:</b> {result.status}
              </p>
              <p>
                <b>Order ID:</b> {result.custom_order_id}
              </p>
              <p>
                <b>Collect ID:</b> {result.collect_id}
              </p>
              <p>
                <b>School:</b> {result.school_id}
              </p>
              <p>
                <b>Gateway:</b> {result.gateway}
              </p>
              <p>
                <b>Amount:</b> ₹{result.transaction_amount}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
