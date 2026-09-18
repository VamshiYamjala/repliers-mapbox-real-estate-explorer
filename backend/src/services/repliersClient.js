const BASE_URL = 'https://api.repliers.io';

export async function fetchListings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/listings?${query}`, {
    headers: {
      'REPLIERS-API-KEY': process.env.REPLIERS_API_KEY,
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Repliers API error: ${response.status}`);
  }

  return response.json();
}
