/**
 * AMFI India Mutual Fund Directory & Live NAV Service.
 * Provides live NAV lookups via the free public AMFI API (api.mfapi.in)
 * with a curated directory of popular Indian direct & growth schemes.
 */

export const POPULAR_INDIAN_MUTUAL_FUNDS = [
  {
    schemeCode: 122639,
    schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    amc: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    nav: 78.42,
    date: '2026-08-20',
  },
  {
    schemeCode: 120503,
    schemeName: 'Mirae Asset Large Cap Fund - Direct Plan - Growth',
    amc: 'Mirae Asset Mutual Fund',
    category: 'Large Cap',
    nav: 114.28,
    date: '2026-08-20',
  },
  {
    schemeCode: 120847,
    schemeName: 'Quant Small Cap Fund - Direct Plan - Growth',
    amc: 'Quant Mutual Fund',
    category: 'Small Cap',
    nav: 268.15,
    date: '2026-08-20',
  },
  {
    schemeCode: 118989,
    schemeName: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth',
    amc: 'HDFC Mutual Fund',
    category: 'Mid Cap',
    nav: 172.9,
    date: '2026-08-20',
  },
  {
    schemeCode: 119598,
    schemeName: 'SBI Bluechip Fund - Direct Plan - Growth',
    amc: 'SBI Mutual Fund',
    category: 'Large Cap',
    nav: 92.65,
    date: '2026-08-20',
  },
  {
    schemeCode: 120716,
    schemeName: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
    amc: 'UTI Mutual Fund',
    category: 'Index Fund',
    nav: 168.3,
    date: '2026-08-20',
  },
  {
    schemeCode: 120586,
    schemeName: 'ICICI Prudential Technology Fund - Direct Plan - Growth',
    amc: 'ICICI Prudential Mutual Fund',
    category: 'Sectoral / Tech',
    nav: 218.45,
    date: '2026-08-20',
  },
  {
    schemeCode: 125354,
    schemeName: 'Axis Small Cap Fund - Direct Plan - Growth',
    amc: 'Axis Mutual Fund',
    category: 'Small Cap',
    nav: 104.12,
    date: '2026-08-20',
  },
  {
    schemeCode: 119800,
    schemeName: 'Motilal Oswal Midcap Fund - Direct Plan - Growth',
    amc: 'Motilal Oswal Mutual Fund',
    category: 'Mid Cap',
    nav: 95.8,
    date: '2026-08-20',
  },
  {
    schemeCode: 120370,
    schemeName: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    amc: 'Nippon India Mutual Fund',
    category: 'Small Cap',
    nav: 162.74,
    date: '2026-08-20',
  },
];

/**
 * Search mutual funds by query text across local directory or remote AMFI lookup.
 * @param {string} query
 * @returns {Promise<Array<Object>>}
 */
export async function searchMutualFunds(query = '') {
  const cleanQ = (query || '').toLowerCase().trim();
  if (!cleanQ) return POPULAR_INDIAN_MUTUAL_FUNDS.slice(0, 6);

  // Local directory match
  const localMatches = POPULAR_INDIAN_MUTUAL_FUNDS.filter(
    (f) =>
      f.schemeName.toLowerCase().includes(cleanQ) ||
      f.amc.toLowerCase().includes(cleanQ) ||
      f.category.toLowerCase().includes(cleanQ)
  );

  if (localMatches.length >= 3 || cleanQ.length < 3) {
    return localMatches;
  }

  // Attempt live search via free public AMFI API
  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanQ)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteFormatted = data.slice(0, 10).map((item) => ({
          schemeCode: item.schemeCode,
          schemeName: item.schemeName,
          amc: 'Indian AMC',
          category: 'Mutual Fund',
          nav: null, // Will fetch on select
        }));
        return remoteFormatted;
      }
    }
  } catch (err) {
    console.warn('Remote AMFI search failed, falling back to local directory:', err);
  }

  return localMatches;
}

/**
 * Fetch the latest NAV for a mutual fund scheme code from AMFI.
 * @param {number|string} schemeCode
 * @returns {Promise<{ nav: number, date: string, schemeName: string }>}
 */
export async function fetchLatestNav(schemeCode) {
  const local = POPULAR_INDIAN_MUTUAL_FUNDS.find((f) => String(f.schemeCode) === String(schemeCode));

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
    if (res.ok) {
      const data = await res.json();
      const latestData = data?.data?.[0];
      if (latestData && latestData.nav) {
        return {
          nav: parseFloat(latestData.nav),
          date: latestData.date,
          schemeName: data?.meta?.scheme_name || local?.schemeName || 'Mutual Fund',
        };
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch latest NAV for ${schemeCode}:`, err);
  }

  if (local) {
    return {
      nav: local.nav,
      date: local.date,
      schemeName: local.schemeName,
    };
  }

  throw new Error(`Could not fetch NAV for scheme ${schemeCode}`);
}
