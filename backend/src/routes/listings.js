import { Router } from 'express';
import { fetchListings } from '../services/repliersClient.js';

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
    const listings = (data.listings || []).map((l) => ({
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
    }));

    res.json({ count: listings.length, listings });
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch listings', detail: err.message });
  }
});

export default router;
