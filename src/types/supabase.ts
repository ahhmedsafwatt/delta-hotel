export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_id: number
          cancelled_at: string | null
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_id: number
          hotel_id: number
          notes: string | null
          num_guests: number
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
        }
        Insert: {
          booking_id?: number
          cancelled_at?: string | null
          check_in_date: string
          check_out_date: string
          created_at?: string
          guest_id: number
          hotel_id: number
          notes?: string | null
          num_guests: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
        }
        Update: {
          booking_id?: number
          cancelled_at?: string | null
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_id?: number
          hotel_id?: number
          notes?: string | null
          num_guests?: number
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["host_id"]
          },
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      famous_places: {
        Row: {
          address: string | null
          category: string | null
          city: string
          country: string
          created_at: string
          description: string | null
          images: Json
          name: string
          place_id: number
          primary_image_url: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city: string
          country: string
          created_at?: string
          description?: string | null
          images?: Json
          name: string
          place_id?: number
          primary_image_url?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          images?: Json
          name?: string
          place_id?: number
          primary_image_url?: string | null
        }
        Relationships: []
      }
      hotel_famous_places: {
        Row: {
          created_at: string
          distance_m: number | null
          hotel_id: number
          place_id: number
        }
        Insert: {
          created_at?: string
          distance_m?: number | null
          hotel_id: number
          place_id: number
        }
        Update: {
          created_at?: string
          distance_m?: number | null
          hotel_id?: number
          place_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "famous_places"
            referencedColumns: ["place_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "hotel_nearby_places"
            referencedColumns: ["place_id"]
          },
        ]
      }
      hotels: {
        Row: {
          address: string
          amenities: Json
          bathrooms: number
          bedrooms: number
          city: string
          country: string
          created_at: string
          description: string | null
          host_id: number
          hotel_id: number
          images: Json
          is_active: boolean
          max_guests: number
          name: string
          price_per_night: number
          primary_image_url: string | null
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: Json
          bathrooms?: number
          bedrooms?: number
          city: string
          country: string
          created_at?: string
          description?: string | null
          host_id: number
          hotel_id?: number
          images?: Json
          is_active?: boolean
          max_guests: number
          name: string
          price_per_night: number
          primary_image_url?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: Json
          bathrooms?: number
          bedrooms?: number
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          host_id?: number
          hotel_id?: number
          images?: Json
          is_active?: boolean
          max_guests?: number
          name?: string
          price_per_night?: number
          primary_image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotels_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "hotels_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["host_id"]
          },
          {
            foreignKeyName: "hotels_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          is_read: boolean
          message: string | null
          notification_id: number
          related_booking_id: number | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: number
        }
        Insert: {
          created_at?: string
          is_read?: boolean
          message?: string | null
          notification_id?: number
          related_booking_id?: number | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: number
        }
        Update: {
          created_at?: string
          is_read?: boolean
          message?: string | null
          notification_id?: number
          related_booking_id?: number | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["host_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: number
          payment_date: string
          payment_id: number
          payment_method: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id: number
          payment_date?: string
          payment_id?: number
          payment_method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: number
          payment_date?: string
          payment_id?: number
          payment_method?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "booking_details"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: number
          comment: string | null
          created_at: string
          guest_id: number
          hotel_id: number
          rating: number
          review_id: number
          updated_at: string
        }
        Insert: {
          booking_id: number
          comment?: string | null
          created_at?: string
          guest_id: number
          hotel_id: number
          rating: number
          review_id?: number
          updated_at?: string
        }
        Update: {
          booking_id?: number
          comment?: string | null
          created_at?: string
          guest_id?: number
          hotel_id?: number
          rating?: number
          review_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "booking_details"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["host_id"]
          },
          {
            foreignKeyName: "reviews_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          bio: string | null
          created_at: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          profile_photo_url: string | null
          updated_at: string
          user_id: number
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: number
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          auth_id?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: number
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          guest_id: number
          hotel_id: number
          wishlist_id: number
        }
        Insert: {
          created_at?: string
          guest_id: number
          hotel_id: number
          wishlist_id?: number
        }
        Update: {
          created_at?: string
          guest_id?: number
          hotel_id?: number
          wishlist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "wishlists_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["host_id"]
          },
          {
            foreignKeyName: "wishlists_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wishlists_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "wishlists_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "wishlists_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
    }
    Views: {
      booking_details: {
        Row: {
          booking_id: number | null
          cancelled_at: string | null
          check_in_date: string | null
          check_out_date: string | null
          city: string | null
          country: string | null
          created_at: string | null
          guest_email: string | null
          guest_first_name: string | null
          guest_id: number | null
          guest_last_name: string | null
          guest_phone: string | null
          hotel_id: number | null
          hotel_image: string | null
          hotel_name: string | null
          notes: string | null
          num_guests: number | null
          payment_id: number | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number | null
          transaction_id: string | null
        }
        Relationships: []
      }
      hotel_listings: {
        Row: {
          amenities: Json | null
          average_rating: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          country: string | null
          host_first_name: string | null
          host_id: number | null
          host_last_name: string | null
          host_photo: string | null
          hotel_id: number | null
          images: Json | null
          is_active: boolean | null
          max_guests: number | null
          name: string | null
          price_per_night: number | null
          primary_image_url: string | null
          review_count: number | null
        }
        Relationships: []
      }
      hotel_nearby_places: {
        Row: {
          category: string | null
          city: string | null
          description: string | null
          distance_m: number | null
          hotel_id: number | null
          name: string | null
          place_id: number | null
          primary_image_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "booking_details"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotel_listings"
            referencedColumns: ["hotel_id"]
          },
          {
            foreignKeyName: "hotel_famous_places_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["hotel_id"]
          },
        ]
      }
    }
    Functions: {
      auth_user_id: { Args: never; Returns: number }
      calculate_booking_price: {
        Args: { p_check_in: string; p_check_out: string; p_hotel_id: number }
        Returns: number
      }
      get_hotel_rating: { Args: { p_hotel_id: number }; Returns: number }
      is_host: { Args: never; Returns: boolean }
      owns_hotel: { Args: { p_hotel_id: number }; Returns: boolean }
      search_available_hotels: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_city: string
          p_num_guests?: number
        }
        Returns: {
          average_rating: number
          city: string
          hotel_id: number
          max_guests: number
          name: string
          price_per_night: number
          primary_image_url: string
          total_price: number
        }[]
      }
      simulate_payment: {
        Args: { p_booking_id: number }
        Returns: Database["public"]["Enums"]["payment_status"]
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      notification_type:
        | "booking_created"
        | "booking_confirmed"
        | "booking_cancelled"
        | "booking_completed"
        | "booking_no_show"
        | "new_review"
        | "payment_completed"
        | "payment_failed"
      payment_status: "pending" | "completed" | "refunded" | "failed"
      user_type: "guest" | "host"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      notification_type: [
        "booking_created",
        "booking_confirmed",
        "booking_cancelled",
        "booking_completed",
        "booking_no_show",
        "new_review",
        "payment_completed",
        "payment_failed",
      ],
      payment_status: ["pending", "completed", "refunded", "failed"],
      user_type: ["guest", "host"],
    },
  },
} as const
