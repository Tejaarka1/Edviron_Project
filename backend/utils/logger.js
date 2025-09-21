// Simple logger util - replace with Winston or Pino for production.
const log = (...args) => console.log(new Date().toISOString(), ...args);
const error = (...args) => console.error(new Date().toISOString(), ...args);

module.exports = { log, error };
