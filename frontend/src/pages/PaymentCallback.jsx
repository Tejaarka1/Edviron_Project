// src/pages/PaymentCallback.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    (async () => {
      const collectRequestId = searchParams.get("collect_request_id") || searchParams.get("EdvironCollectRequestId") || searchParams.get("collect_id") || searchParams.get("EdvironCollectRequestId");
      const status = searchParams.get("status") || searchParams.get("status_code");

      if (!collectRequestId) {
        setMessage("Missing collect_request_id in callback URL");
        return;
      }

      try {
        // Call backend to ask the gateway for canonical status and update DB
        const res = await axiosClient.get(`/payment/status/${encodeURIComponent(collectRequestId)}`);
        if (res.data && res.data.updatedStatus) {
          setMessage(`Payment ${res.data.updatedStatus.status || "updated"}. Redirecting to transactions...`);
        } else {
          setMessage("Payment processed. Redirecting...");
        }
      } catch (err) {
        console.error("Error checking status:", err);
        setMessage("Failed to confirm payment status.");
      }

      setTimeout(() => navigate("/dashboard/transactions"), 1500);
    })();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}
