// src/pages/PaymentCallback.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Edviron redirect usually sends collect_request_id or custom_order_id in query
        const collectRequestId = searchParams.get("collect_request_id");
        const customOrderId = searchParams.get("custom_order_id");

        if (collectRequestId) {
          // Call backend to re-verify payment status
          const res = await axiosClient.get(`/payment/status/${collectRequestId}`);
          setDetails(res.data.gatewayResp || res.data);
          setStatus(res.data.gatewayResp?.status || "unknown");
        } else if (customOrderId) {
          const res = await axiosClient.get(`/transaction-status/${customOrderId}`);
          setDetails(res.data);
          setStatus(res.data.status || "unknown");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus("failed");
      }
    }
    verifyPayment();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {status === "processing" && <h2 className="text-xl font-bold">Verifying payment...</h2>}

      {status === "success" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h2>
          <p className="mt-2">Order ID: {details?.custom_order_id || "-"}</p>
          <p className="mt-1">Amount: ₹{details?.transaction_amount || "-"}</p>
          <Link
            to="/dashboard/transactions"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Transactions
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Payment Failed ❌</h2>
          <p className="mt-2">Please try again later.</p>
          <Link
            to="/dashboard/transactions"
            className="mt-4 inline-block bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Transactions
          </Link>
        </div>
      )}
    </div>
  );
}
