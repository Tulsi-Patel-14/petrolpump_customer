// Haversine formula to calculate distance between two coordinates in meters
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance; // Distance in meters
};

export const checkGeofence = (
  userLat: number,
  userLon: number,
  stationLat: number,
  stationLon: number,
  radiusMeters: number
): { isInside: boolean; distanceMeters: number } => {
  const distanceMeters = calculateDistance(userLat, userLon, stationLat, stationLon);
  return {
    isInside: distanceMeters <= radiusMeters,
    distanceMeters: Math.round(distanceMeters),
  };
};
