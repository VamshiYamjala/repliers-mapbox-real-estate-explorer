import { Router } from 'express';
import { fetchListings } from '../services/repliersClient.js';

function normalizeTourMedia(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const directUrl = rawUrl.trim();
  let embedUrl = directUrl;
  let provider = 'Virtual Tour';
  let is3D = false;

  // Transform YouTube watch/short URLs into standard embed URLs to prevent X-Frame-Options blocking
  const ytMatch = directUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/i);
  if (ytMatch && ytMatch[1]) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    provider = 'YouTube Video Tour';
  } else if (directUrl.includes('matterport.com')) {
    provider = 'Matterport 3D Tour';
    is3D = true;
  } else if (directUrl.includes('propertypanorama.com')) {
    provider = 'Property Panorama 360';
  } else if (directUrl.includes('homediary.com')) {
    provider = 'HomeDiary Virtual Tour';
  } else if (directUrl.includes('modsy.com')) {
    provider = 'Modsy 3D Walkthrough';
    is3D = true;
  } else if (directUrl.includes('tourfactory.com')) {
    provider = 'TourFactory Virtual Tour';
  }

  return {
    type: 'virtual-tour',
    url: directUrl,
    directUrl,
    embedUrl,
    provider,
    is3D,
  };
}

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minBedrooms, minBaths, propertyType, resultsPerPage } = req.query;
    const params = { resultsPerPage: resultsPerPage || 20 };

    if (city) params.city = city;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minBedrooms) params.minBedrooms = minBedrooms;
    if (minBaths) params.minBaths = minBaths;
    if (propertyType) params.propertyType = propertyType;

    const data = await fetchListings(params);
    const listings = (data.listings || []).map((l) => {
      const canDisplay = l.permissions?.displayPublic !== 'N' && l.permissions?.displayInternetEntireListing !== 'N';
      const tourUrl = l.details?.virtualTourUrl || l.details?.alternateURLVideoLink || null;

      let media3d = null;
      if (canDisplay && tourUrl) {
        media3d = normalizeTourMedia(tourUrl);
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

    res.json({ count: listings.length, listings });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch listings', detail: err.message });
  }
});

export default router;
