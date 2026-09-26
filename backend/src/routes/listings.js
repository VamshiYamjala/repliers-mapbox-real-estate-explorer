import { Router } from 'express';
import { fetchListings } from '../services/repliersClient.js';

function normalizeTourMedia(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const directUrl = rawUrl.trim();
  let embedUrl = directUrl;
  let type = null;
  let provider = '';
  let label = '';
  let is3D = false;

  // 1. YouTube Video Tours: Transform watch/short URLs into standard embed URLs
  const ytMatch = directUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/i);
  if (ytMatch && ytMatch[1]) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    type = 'video-tour';
    provider = 'YouTube Video';
    label = 'Video Tour';
    is3D = false;
  }
  // 2. Modsy 3D Walkthroughs (Genuine spatial interactive 3D model homes)
  else if (directUrl.includes('modsy.com')) {
    type = '3d-walkthrough';
    provider = 'Modsy 3D';
    label = '3D Walkthrough';
    is3D = true;
  }
  // 3. Matterport 3D Tours (Genuine 3D spatial digital twins)
  else if (directUrl.includes('matterport.com')) {
    type = '3d-walkthrough';
    provider = 'Matterport 3D';
    label = '3D Walkthrough';
    is3D = true;
  }

  // If not a verified 3D walkthrough or YouTube video tour, exclude it to avoid expired/stale provider screens
  if (!type) {
    return null;
  }

  return {
    type,
    url: directUrl,
    directUrl,
    embedUrl,
    provider,
    label,
    is3D,
  };
}

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minBedrooms, minBaths, propertyType, resultsPerPage, pageNum } = req.query;
    const page = Math.max(1, parseInt(pageNum, 10) || 1);
    const limit = Math.max(1, parseInt(resultsPerPage, 10) || 20);

    const params = {
      pageNum: page,
      resultsPerPage: limit,
    };

    if (city) params.city = city;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minBedrooms) params.minBedrooms = minBedrooms;
    if (minBaths) params.minBaths = minBaths;
    if (propertyType) params.propertyType = propertyType;

    const data = await fetchListings(params);
    const listings = (data.listings || []).map((l) => {
      const canDisplay = l.permissions?.displayPublic !== 'N' && l.permissions?.displayInternetEntireListing !== 'N';
      let media3d = null;
      if (canDisplay) {
        media3d = normalizeTourMedia(l.details?.virtualTourUrl) || normalizeTourMedia(l.details?.alternateURLVideoLink);
      }

      return {
        id: l.mlsNumber,
        price: l.listPrice,
        bedrooms: l.details?.numBedrooms,
        bathrooms: l.details?.numBathrooms,
        propertyType: l.details?.propertyType,
        city: l.address?.city,
        address: `${l.address?.streetNumber || ''} ${l.address?.streetName || ''} ${l.address?.streetSuffix || ''}`.trim(),
        lat: l.map?.latitude,
        lng: l.map?.longitude,
        image: l.images?.[0] ? `https://cdn.repliers.io/${l.images[0]}` : null,
        photoCount: l.photoCount,
        media3d,
      };
    });

    const currentPage = data.page || page;
    const totalPages = data.numPages || 1;
    const totalCount = data.count != null ? data.count : listings.length;
    const hasMore = currentPage < totalPages && listings.length > 0;

    res.json({
      page: currentPage,
      numPages: totalPages,
      pageSize: limit,
      totalCount,
      hasMore,
      count: listings.length,
      listings,
    });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch listings', detail: err.message });
  }
});

export default router;
