// src/pages/TransactionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTransactionById } from "../api/transactionApi";

export default function TransactionDetails() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchTransactionById(id);
        setTransaction(res);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!transaction) return <div>Loading...</div>;

  const { order, latestStatus } = transaction;

  return (
    <div style={{ padding: 20 }}>
      <h2>Transaction Details</h2>
      <p><strong>Order ID:</strong> {order?.custom_order_id}</p>
      <p><strong>School:</strong> {order?.school_id}</p>
      <p><strong>Amount:</strong> ₹{latestStatus?.order_amount}</p>
      <p><strong>Transaction Amt:</strong> ₹{latestStatus?.transaction_amount}</p>
      <p><strong>Payment Method:</strong> {latestStatus?.payment_mode}</p>
      <p><strong>Status:</strong> {latestStatus?.status}</p>
      <p><strong>Student:</strong> {order?.student_name || "N/A"}</p>
      <p><strong>Phone:</strong> {order?.phone || "N/A"}</p>
      <p><strong>Date:</strong> {latestStatus?.payment_time ? new Date(latestStatus.payment_time).toLocaleString() : "N/A"}</p>
    </div>
  );
}
