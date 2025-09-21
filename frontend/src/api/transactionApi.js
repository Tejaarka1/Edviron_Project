// src/api/transactionApi.js
import axiosClient from "./axiosClient";

// List transactions
export const fetchTransactions = async (params = {}) => {
  const res = await axiosClient.get("/transactions", { params });
  return res.data;
};

// ✅ Get single transaction by ID
export const fetchTransactionById = async (id) => {
  const res = await axiosClient.get(`/transactions/${id}`);
  return res.data;  // returns { order, latestStatus }
};

// Transactions by school
export const fetchTransactionsBySchool = async (schoolId, params = {}) => {
  const res = await axiosClient.get(`/transactions/school/${schoolId}`, { params });
  return res.data;
};

// Check transaction status
export const checkTransactionStatus = async (id) => {
  const res = await axiosClient.get(`/transaction-status/${id}`);
  return res.data;
};
