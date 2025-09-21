// backend/services/payment.service.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE = process.env.PAYMENT_BASE_URL; // e.g. https://dev-vanilla.edviron.com/erp
const API_KEY = process.env.PAYMENT_API_KEY; // Authorization Bearer token (long JWT-like string)
const PG_KEY = process.env.PAYMENT_PG_KEY;   // pg_key (signing secret) - e.g. edvtest01
const SCHOOL_ID = process.env.SCHOOL_ID;

if (!BASE) throw new Error('PAYMENT_BASE_URL not set');
if (!API_KEY) throw new Error('PAYMENT_API_KEY not set');
if (!PG_KEY) throw new Error('PAYMENT_PG_KEY not set');

/**
 * Create collect request
 * Payload should include school_id, amount, callback_url and sign (JWT signed by PG_KEY)
 * Returns gateway response (which contains collect_request_id and Collect_request_url)
 */
async function callCreateCollectRequest({ amount, callback_url }) {
  // Build sign JWT payload exactly as the doc requires
  const signPayload = {
    school_id: String(SCHOOL_ID),
    amount: String(amount),
    callback_url: String(callback_url)
  };

  // Sign using PG_KEY (HS256 default)
  const sign = jwt.sign(signPayload, PG_KEY, { algorithm: 'HS256' });

  const body = {
    school_id: signPayload.school_id,
    amount: signPayload.amount,
    callback_url: signPayload.callback_url,
    sign
  };

  // Authorization header must be Bearer <API_KEY>
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

  const url = `${BASE}/create-collect-request`; // e.g. https://dev-vanilla.edviron.com/erp/create-collect-request

  const resp = await axios.post(url, body, { headers, timeout: 15000 });
  return resp.data;
}

/**
 * Check collect request status
 * Accepts collect_request_id and returns gateway status object
 * Requires building sign = jwt({ school_id, collect_request_id }, PG_KEY)
 */
async function checkCollectRequestStatus(collect_request_id) {
  const signPayload = {
    school_id: String(SCHOOL_ID),
    collect_request_id: String(collect_request_id)
  };
  const sign = jwt.sign(signPayload, PG_KEY, { algorithm: 'HS256' });

  const url = `${BASE}/collect-request/${collect_request_id}?school_id=${encodeURIComponent(signPayload.school_id)}&sign=${encodeURIComponent(sign)}`;
  const headers = {
    'Authorization': `Bearer ${API_KEY}`
  };
  const resp = await axios.get(url, { headers, timeout: 15000 });
  return resp.data;
}

module.exports = { callCreateCollectRequest, checkCollectRequestStatus };
