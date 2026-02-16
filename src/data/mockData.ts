import type { Hotel, Booking } from "../types";

export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Grand Luxe Hotel",
    description:
      "Experience ultimate luxury in the heart of the city. Our five-star hotel offers world-class amenities and impeccable service.",
    location: "123 Downtown Avenue",
    city: "New York",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5fGVufDF8fHx8MTc3MDg3NzM5NHww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 299,
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking"],
    rooms: 120,
    available: true,
  },
  {
    id: "2",
    name: "Coastal Paradise Resort",
    description:
      "Wake up to stunning ocean views. Perfect for a relaxing beach getaway with family and friends.",
    location: "456 Beach Road",
    city: "Miami",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1729717949782-f40c4a07e3c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMGhvdGVsfGVufDF8fHx8MTc3MDg4OTcyOXww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 399,
    rating: 4.9,
    amenities: [
      "WiFi",
      "Beach Access",
      "Pool",
      "Restaurant",
      "Bar",
      "Water Sports",
    ],
    rooms: 85,
    available: true,
  },
  {
    id: "3",
    name: "Urban Boutique Hotel",
    description:
      "Modern elegance meets comfort. Stay in the trendiest neighborhood with easy access to shopping and entertainment.",
    location: "789 Fashion Street",
    city: "Los Angeles",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1764391707805-3623b906a8de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzcwOTkwMzM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 249,
    rating: 4.7,
    amenities: ["WiFi", "Restaurant", "Rooftop Bar", "Gym", "Concierge"],
    rooms: 60,
    available: true,
  },
  {
    id: "4",
    name: "Mountain View Lodge",
    description:
      "Escape to nature with breathtaking mountain views. Ideal for adventure seekers and nature lovers.",
    location: "321 Alpine Drive",
    city: "Denver",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1572177215152-32f247303126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzcwODg3MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 199,
    rating: 4.6,
    amenities: ["WiFi", "Fireplace", "Hiking Trails", "Restaurant", "Spa"],
    rooms: 45,
    available: true,
  },
  {
    id: "5",
    name: "Skyline Tower Hotel",
    description:
      "Contemporary luxury with panoramic city views. Perfect for business travelers and urban explorers.",
    location: "555 Business District",
    city: "Chicago",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1770017408222-dc83f61d9725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwaG90ZWwlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzA5ODcxODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 279,
    rating: 4.7,
    amenities: [
      "WiFi",
      "Pool",
      "Business Center",
      "Restaurant",
      "Gym",
      "Meeting Rooms",
    ],
    rooms: 200,
    available: true,
  },
  {
    id: "6",
    name: "Tropical Oasis Resort",
    description:
      "An exclusive island paradise with pristine pools and lush gardens. Your dream vacation awaits.",
    location: "999 Paradise Island",
    city: "Honolulu",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzcwOTU4NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 449,
    rating: 5.0,
    amenities: [
      "WiFi",
      "Multiple Pools",
      "Spa",
      "Restaurant",
      "Bar",
      "Beach Access",
      "Kids Club",
    ],
    rooms: 150,
    available: true,
  },
  {
    id: "7",
    name: "The Royal Plaza",
    description:
      "Luxury redefined with world-class service and elegant interiors. Perfect for a memorable stay.",
    location: "888 Royal Boulevard",
    city: "Las Vegas",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1729673766770-83160c576668?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnQlMjBob3RlbHxlbnwxfHx8fDE3NzA5OTA1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 349,
    rating: 4.9,
    amenities: [
      "WiFi",
      "Casino",
      "Pool",
      "Spa",
      "Restaurant",
      "Bar",
      "Entertainment",
    ],
    rooms: 300,
    available: true,
  },
  {
    id: "8",
    name: "Executive Business Suites",
    description:
      "Designed for the modern business traveler. Spacious rooms with dedicated workspaces.",
    location: "777 Corporate Plaza",
    city: "San Francisco",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1546034746-25df3092cc5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NzA5OTA1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 289,
    rating: 4.6,
    amenities: [
      "WiFi",
      "Business Center",
      "Meeting Rooms",
      "Restaurant",
      "Gym",
      "Concierge",
    ],
    rooms: 95,
    available: true,
  },
  {
    id: "9",
    name: "Downtown Comfort Inn",
    description:
      "Affordable comfort in the city center. Great value with all essential amenities.",
    location: "222 Main Street",
    city: "Seattle",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1559422876-99bdae91193c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb3dudG93biUyMGNpdHklMjBob3RlbHxlbnwxfHx8fDE3NzA5OTA1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 159,
    rating: 4.4,
    amenities: ["WiFi", "Breakfast", "Parking", "Pet Friendly"],
    rooms: 80,
    available: true,
  },
  {
    id: "10",
    name: "Sunset Beach Hotel",
    description:
      "Romantic beachfront property with stunning sunset views. Perfect for couples and honeymooners.",
    location: "111 Sunset Boulevard",
    city: "Santa Monica",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1729717949948-56b52db111dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzcwOTU4NTcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 329,
    rating: 4.8,
    amenities: [
      "WiFi",
      "Beach Access",
      "Pool",
      "Restaurant",
      "Spa",
      "Balconies",
    ],
    rooms: 70,
    available: true,
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    hotelId: "1",
    hotelName: "Grand Luxe Hotel",
    guestName: "John Smith",
    guestEmail: "john.smith@example.com",
    checkIn: "2026-03-15",
    checkOut: "2026-03-18",
    guests: 2,
    totalPrice: 897,
    status: "confirmed",
    createdAt: "2026-02-10",
  },
  {
    id: "b2",
    hotelId: "2",
    hotelName: "Coastal Paradise Resort",
    guestName: "Sarah Johnson",
    guestEmail: "sarah.johnson@example.com",
    checkIn: "2026-04-20",
    checkOut: "2026-04-25",
    guests: 4,
    totalPrice: 1995,
    status: "confirmed",
    createdAt: "2026-02-11",
  },
  {
    id: "b3",
    hotelId: "3",
    hotelName: "Urban Boutique Hotel",
    guestName: "Michael Chen",
    guestEmail: "michael.chen@example.com",
    checkIn: "2026-02-20",
    checkOut: "2026-02-22",
    guests: 1,
    totalPrice: 498,
    status: "pending",
    createdAt: "2026-02-12",
  },
  {
    id: "b4",
    hotelId: "5",
    hotelName: "Skyline Tower Hotel",
    guestName: "Emily Rodriguez",
    guestEmail: "emily.r@example.com",
    checkIn: "2026-03-10",
    checkOut: "2026-03-13",
    guests: 2,
    totalPrice: 837,
    status: "confirmed",
    createdAt: "2026-02-08",
  },
  {
    id: "b5",
    hotelId: "6",
    hotelName: "Tropical Oasis Resort",
    guestName: "David Martinez",
    guestEmail: "david.martinez@example.com",
    checkIn: "2026-05-01",
    checkOut: "2026-05-07",
    guests: 3,
    totalPrice: 2694,
    status: "confirmed",
    createdAt: "2026-01-25",
  },
  {
    id: "b6",
    hotelId: "4",
    hotelName: "Mountain View Lodge",
    guestName: "Jessica Lee",
    guestEmail: "jessica.lee@example.com",
    checkIn: "2026-02-28",
    checkOut: "2026-03-02",
    guests: 2,
    totalPrice: 398,
    status: "pending",
    createdAt: "2026-02-13",
  },
  {
    id: "b7",
    hotelId: "7",
    hotelName: "The Royal Plaza",
    guestName: "Robert Taylor",
    guestEmail: "robert.taylor@example.com",
    checkIn: "2026-03-22",
    checkOut: "2026-03-25",
    guests: 2,
    totalPrice: 1047,
    status: "confirmed",
    createdAt: "2026-02-05",
  },
  {
    id: "b8",
    hotelId: "8",
    hotelName: "Executive Business Suites",
    guestName: "Amanda Wilson",
    guestEmail: "amanda.w@example.com",
    checkIn: "2026-02-18",
    checkOut: "2026-02-21",
    guests: 1,
    totalPrice: 867,
    status: "confirmed",
    createdAt: "2026-02-01",
  },
  {
    id: "b9",
    hotelId: "1",
    hotelName: "Grand Luxe Hotel",
    guestName: "Christopher Brown",
    guestEmail: "chris.brown@example.com",
    checkIn: "2026-04-05",
    checkOut: "2026-04-08",
    guests: 2,
    totalPrice: 897,
    status: "pending",
    createdAt: "2026-02-12",
  },
  {
    id: "b10",
    hotelId: "9",
    hotelName: "Downtown Comfort Inn",
    guestName: "Michelle Garcia",
    guestEmail: "michelle.g@example.com",
    checkIn: "2026-03-01",
    checkOut: "2026-03-03",
    guests: 2,
    totalPrice: 318,
    status: "confirmed",
    createdAt: "2026-02-09",
  },
  {
    id: "b11",
    hotelId: "10",
    hotelName: "Sunset Beach Hotel",
    guestName: "Daniel White",
    guestEmail: "daniel.white@example.com",
    checkIn: "2026-06-15",
    checkOut: "2026-06-20",
    guests: 2,
    totalPrice: 1645,
    status: "confirmed",
    createdAt: "2026-01-20",
  },
  {
    id: "b12",
    hotelId: "2",
    hotelName: "Coastal Paradise Resort",
    guestName: "Lisa Anderson",
    guestEmail: "lisa.anderson@example.com",
    checkIn: "2026-03-28",
    checkOut: "2026-04-01",
    guests: 3,
    totalPrice: 1596,
    status: "pending",
    createdAt: "2026-02-13",
  },
  {
    id: "b13",
    hotelId: "3",
    hotelName: "Urban Boutique Hotel",
    guestName: "Kevin Harris",
    guestEmail: "kevin.harris@example.com",
    checkIn: "2026-02-25",
    checkOut: "2026-02-27",
    guests: 1,
    totalPrice: 498,
    status: "cancelled",
    createdAt: "2026-02-07",
  },
  {
    id: "b14",
    hotelId: "7",
    hotelName: "The Royal Plaza",
    guestName: "Patricia Moore",
    guestEmail: "patricia.m@example.com",
    checkIn: "2026-04-12",
    checkOut: "2026-04-16",
    guests: 4,
    totalPrice: 1396,
    status: "confirmed",
    createdAt: "2026-02-04",
  },
  {
    id: "b15",
    hotelId: "6",
    hotelName: "Tropical Oasis Resort",
    guestName: "Thomas Jackson",
    guestEmail: "thomas.j@example.com",
    checkIn: "2026-07-10",
    checkOut: "2026-07-17",
    guests: 5,
    totalPrice: 3143,
    status: "pending",
    createdAt: "2026-02-13",
  },
];

// Local storage helper functions
const STORAGE_KEYS = {
  HOTELS: "hotels_data",
  BOOKINGS: "bookings_data",
  AUTH: "admin_auth",
};

export const storageService = {
  // Hotels
  getHotels: (): Hotel[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOTELS);
      return data ? JSON.parse(data) : mockHotels;
    } catch (error) {
      console.error("Error parsing hotels from localStorage:", error);
      return mockHotels;
    }
  },

  saveHotels: (hotels: Hotel[]) => {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
  },

  addHotel: (hotel: Hotel) => {
    const hotels = storageService.getHotels();
    hotels.push(hotel);
    storageService.saveHotels(hotels);
  },

  updateHotel: (id: string, updatedHotel: Hotel) => {
    const hotels = storageService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index !== -1) {
      hotels[index] = updatedHotel;
      storageService.saveHotels(hotels);
    }
  },

  deleteHotel: (id: string) => {
    const hotels = storageService.getHotels();
    const filtered = hotels.filter((h) => h.id !== id);
    storageService.saveHotels(filtered);
  },

  // Bookings
  getBookings: (): Booking[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : mockBookings;
    } catch (error) {
      console.error("Error parsing bookings from localStorage:", error);
      return mockBookings;
    }
  },

  saveBookings: (bookings: Booking[]) => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  addBooking: (booking: Booking) => {
    const bookings = storageService.getBookings();
    bookings.push(booking);
    storageService.saveBookings(bookings);
  },

  updateBookingStatus: (id: string, status: Booking["status"]) => {
    const bookings = storageService.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings[index].status = status;
      storageService.saveBookings(bookings);
    }
  },

  // Auth
  isAuthenticated: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === "true";
  },

  login: () => {
    localStorage.setItem(STORAGE_KEYS.AUTH, "true");
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },
};
