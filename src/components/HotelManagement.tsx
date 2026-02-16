import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import type { Hotel } from "../types";
import { storageService } from "../data/mockData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

export default function HotelManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    country: "",
    image: "",
    price: 0,
    rating: 5,
    amenities: "",
    rooms: 0,
    available: true,
  });

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = () => {
    const loadedHotels = storageService.getHotels();
    setHotels(loadedHotels);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      city: "",
      country: "",
      image: "",
      price: 0,
      rating: 5,
      amenities: "",
      rooms: 0,
      available: true,
    });
    setEditingHotel(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hotelData: Hotel = {
      id: editingHotel?.id || `h${Date.now()}`,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      city: formData.city,
      country: formData.country,
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1572177215152-32f247303126?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzcwODg3MDIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      price: Number(formData.price),
      rating: Number(formData.rating),
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      rooms: Number(formData.rooms),
      available: formData.available,
    };

    if (editingHotel) {
      storageService.updateHotel(editingHotel.id, hotelData);
      toast.success("Hotel updated successfully!");
    } else {
      storageService.addHotel(hotelData);
      toast.success("Hotel added successfully!");
    }

    loadHotels();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description,
      location: hotel.location,
      city: hotel.city,
      country: hotel.country,
      image: hotel.image,
      price: hotel.price,
      rating: hotel.rating,
      amenities: hotel.amenities.join(", "),
      rooms: hotel.rooms,
      available: hotel.available,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hotel?")) {
      storageService.deleteHotel(id);
      loadHotels();
      toast.success("Hotel deleted successfully!");
    }
  };

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Hotel Management</h2>
          <p className="text-gray-600">
            Manage your hotel listings and inventory
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="size-4 mr-2" />
              Add New Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingHotel ? "Edit Hotel" : "Add New Hotel"}
              </DialogTitle>
              <DialogDescription>
                {editingHotel
                  ? "Update hotel information"
                  : "Fill in the details to add a new hotel"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Hotel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Address</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per Night ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    min="1"
                    value={formData.rooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rooms: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  placeholder="WiFi, Pool, Spa, Restaurant"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
                <Label htmlFor="available">Available for booking</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingHotel ? "Update Hotel" : "Add Hotel"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No hotels found. Add your first hotel to get started.
                  </TableCell>
                </TableRow>
              ) : (
                hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="size-12 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-gray-500">
                            {hotel.rooms} rooms
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="size-3" />
                        {hotel.city}, {hotel.country}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${hotel.price}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{hotel.rating} ⭐</Badge>
                    </TableCell>
                    <TableCell>{hotel.rooms}</TableCell>
                    <TableCell>
                      <Badge
                        variant={hotel.available ? "default" : "secondary"}
                      >
                        {hotel.available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(hotel)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(hotel.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
