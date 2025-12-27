/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Determine attendance status based on distance and time
 * @param {number} distance - Distance from center in meters
 * @param {number} radius - Allowed radius in meters
 * @param {Date} sessionStart - Session start time
 * @param {number} lateThreshold - Minutes after start to be marked late
 * @returns {string} Status: PRESENT, LATE, or INVALID
 */
export function determineStatus(distance, radius, sessionStart, lateThreshold = 15) {
    if (distance > radius) {
        return 'INVALID';
    }

    const now = new Date();
    const lateTime = new Date(sessionStart.getTime() + lateThreshold * 60000);

    if (now > lateTime) {
        return 'LATE';
    }

    return 'PRESENT';
}
