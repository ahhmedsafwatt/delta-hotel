export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  country: string;
  image: string;
  price: number;
  rating: number;
  amenities: string[];
  rooms: number;
  available: boolean;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
