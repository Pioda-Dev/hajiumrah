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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      dokumen: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jamaah_id: string | null
          passport: string
          passport_expired: string | null
          tiket: string
          updated_at: string
          vaksin: string
          visa: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jamaah_id?: string | null
          passport?: string
          passport_expired?: string | null
          tiket?: string
          updated_at?: string
          vaksin?: string
          visa?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jamaah_id?: string | null
          passport?: string
          passport_expired?: string | null
          tiket?: string
          updated_at?: string
          vaksin?: string
          visa?: string
        }
        Relationships: [
          {
            foreignKeyName: "dokumen_jamaah_id_fkey"
            columns: ["jamaah_id"]
            isOneToOne: false
            referencedRelation: "jamaah"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          image_url: string
          judul: string | null
          subjudul: string | null
          urutan: number
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          image_url: string
          judul?: string | null
          subjudul?: string | null
          urutan?: number
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          image_url?: string
          judul?: string | null
          subjudul?: string | null
          urutan?: number
        }
        Relationships: []
      }
      jamaah: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          id: string
          nama: string
          nik: string | null
          paket_id: string | null
          status: string
          telepon: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nama: string
          nik?: string | null
          paket_id?: string | null
          status?: string
          telepon?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nama?: string
          nik?: string | null
          paket_id?: string | null
          status?: string
          telepon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jamaah_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket"
            referencedColumns: ["id"]
          },
        ]
      }
      keberangkatan: {
        Row: {
          created_at: string
          id: string
          jumlah_jamaah: number
          kode: string
          maskapai: string
          rute: string
          status: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah_jamaah?: number
          kode: string
          maskapai?: string
          rute?: string
          status?: string
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah_jamaah?: number
          kode?: string
          maskapai?: string
          rute?: string
          status?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      keuangan: {
        Row: {
          created_at: string
          id: string
          jenis: string
          kategori: string
          keterangan: string
          nominal: number
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jenis?: string
          kategori?: string
          keterangan: string
          nominal?: number
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jenis?: string
          kategori?: string
          keterangan?: string
          nominal?: number
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      paket: {
        Row: {
          created_at: string
          durasi: number
          harga: number
          hotel: string
          id: string
          kuota: number
          maskapai: string
          nama: string
          tersisa: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          durasi?: number
          harga?: number
          hotel?: string
          id?: string
          kuota?: number
          maskapai?: string
          nama: string
          tersisa?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          durasi?: number
          harga?: number
          hotel?: string
          id?: string
          kuota?: number
          maskapai?: string
          nama?: string
          tersisa?: number
          updated_at?: string
        }
        Relationships: []
      }
      pembayaran: {
        Row: {
          created_at: string
          dibayar: number
          id: string
          invoice: string
          jamaah_id: string | null
          metode: string
          status: string
          tanggal: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          dibayar?: number
          id?: string
          invoice: string
          jamaah_id?: string | null
          metode?: string
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          dibayar?: number
          id?: string
          invoice?: string
          jamaah_id?: string | null
          metode?: string
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_jamaah_id_fkey"
            columns: ["jamaah_id"]
            isOneToOne: false
            referencedRelation: "jamaah"
            referencedColumns: ["id"]
          },
        ]
      }
      pemesanan: {
        Row: {
          created_at: string
          id: string
          invoice: string
          jamaah_id: string | null
          paket_id: string | null
          status: string
          tanggal: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice: string
          jamaah_id?: string | null
          paket_id?: string | null
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice?: string
          jamaah_id?: string | null
          paket_id?: string | null
          status?: string
          tanggal?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pemesanan_jamaah_id_fkey"
            columns: ["jamaah_id"]
            isOneToOne: false
            referencedRelation: "jamaah"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pemesanan_paket_id_fkey"
            columns: ["paket_id"]
            isOneToOne: false
            referencedRelation: "paket"
            referencedColumns: ["id"]
          },
        ]
      }
      pengaturan: {
        Row: {
          alamat: string | null
          created_at: string
          email: string | null
          id: string
          mata_uang: string
          nama_travel: string
          no_izin: string | null
          telepon: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mata_uang?: string
          nama_travel?: string
          no_izin?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mata_uang?: string
          nama_travel?: string
          no_izin?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
    },
  },
} as const
