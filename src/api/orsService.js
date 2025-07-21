import axios from 'axios';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

export async function getRoute(pickupCoords, deliveryCoords) {
    try {
        const response = await axios.post(
            ORS_BASE_URL,
            {
                coordinates: [pickupCoords, deliveryCoords]
            },
            {
                headers: {
                    Authorization: ORS_API_KEY,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('ORS Route Error:', error);
        throw error;
    }
}
