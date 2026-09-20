// Netlify Function: verify-license
// Purpose: check a Lemon Squeezy license key without exposing any secret
// key in the browser. Lemon Squeezy's /licenses/validate endpoint only
// needs the license key itself (no secret required), so this function is
// mainly a CORS-safe proxy plus a place to add your own checks later
// (e.g. rate limiting, logging activations to a database).
//
// Deploy: this file just needs to exist at netlify/functions/verify-license.js
// and netlify.toml needs a [functions] block (see netlify.toml in this repo).
// No environment variables are required for the basic Lemon Squeezy flow.

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ valid: false, error: 'Method not allowed' }) };
  }

  let licenseKey;
  try {
    licenseKey = JSON.parse(event.body || '{}').licenseKey;
  } catch (e) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ valid: false, error: 'Malformed request' }) };
  }
  if (!licenseKey || typeof licenseKey !== 'string') {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ valid: false, error: 'Missing license key' }) };
  }

  try {
    const resp = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({ license_key: licenseKey })
    });
    const data = await resp.json();

    // data.valid is Lemon Squeezy's own field. We pass through a trimmed
    // shape so the front end never sees more than it needs.
    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        valid: !!data.valid,
        status: data.license_key ? data.license_key.status : null,
        activationLimit: data.license_key ? data.license_key.activation_limit : null,
        activationUsage: data.license_key ? data.license_key.activation_usage : null
      })
    };
  } catch (e) {
    return { statusCode: 502, headers: cors, body: JSON.stringify({ valid: false, error: 'Could not reach license service' }) };
  }
};
