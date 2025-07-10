export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          data: string
          horario: string
          id: string
          observacoes: string | null
          servico_id: string | null
          status: Database["public"]["Enums"]["agendamento_status"] | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"] | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"] | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          email: string
          endereco: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          endereco?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cobrancas: {
        Row: {
          created_at: string | null
          data_entrega: string | null
          data_envio: string | null
          data_leitura: string | null
          divida_id: string | null
          erro: string | null
          id: string
          mensagem: string | null
          resposta: string | null
          status: string | null
          tentativa: number | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          divida_id?: string | null
          erro?: string | null
          id?: string
          mensagem?: string | null
          resposta?: string | null
          status?: string | null
          tentativa?: number | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          divida_id?: string | null
          erro?: string | null
          id?: string
          mensagem?: string | null
          resposta?: string | null
          status?: string | null
          tentativa?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_divida_id_fkey"
            columns: ["divida_id"]
            isOneToOne: false
            referencedRelation: "dividas"
            referencedColumns: ["id"]
          },
        ]
      }
      devedores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dividas: {
        Row: {
          created_at: string | null
          data_inclusao: string | null
          data_vencimento: string
          descricao: string
          devedor_id: string | null
          id: string
          observacoes: string | null
          status: string | null
          updated_at: string | null
          valor_atual: number
          valor_original: number
        }
        Insert: {
          created_at?: string | null
          data_inclusao?: string | null
          data_vencimento: string
          descricao: string
          devedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor_atual: number
          valor_original: number
        }
        Update: {
          created_at?: string | null
          data_inclusao?: string | null
          data_vencimento?: string
          descricao?: string
          devedor_id?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          updated_at?: string | null
          valor_atual?: number
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_devedor_id_fkey"
            columns: ["devedor_id"]
            isOneToOne: false
            referencedRelation: "devedores"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_available: boolean | null
          license_category: string
          license_expiry_date: string | null
          license_number: string | null
          license_photo_url: string | null
          rating: number | null
          status: string | null
          total_rides: number | null
          vehicle_brand: string
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_plate: string
          vehicle_year: number | null
        }
        Insert: {
          current_latitude?: number | null
          current_longitude?: number | null
          id: string
          is_available?: boolean | null
          license_category?: string
          license_expiry_date?: string | null
          license_number?: string | null
          license_photo_url?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          vehicle_brand?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate: string
          vehicle_year?: number | null
        }
        Update: {
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          license_category?: string
          license_expiry_date?: string | null
          license_number?: string | null
          license_photo_url?: string | null
          rating?: number | null
          status?: string | null
          total_rides?: number | null
          vehicle_brand?: string
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string
          vehicle_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_venda: {
        Row: {
          created_at: string | null
          id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          subtotal: number
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          preco_unitario: number
          produto_id?: string | null
          quantidade: number
          subtotal: number
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_negra: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_inclusao: string | null
          id: string
          motivo: string | null
          telefone: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_inclusao?: string | null
          id?: string
          motivo?: string | null
          telefone: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_inclusao?: string | null
          id?: string
          motivo?: string | null
          telefone?: string
        }
        Relationships: []
      }
      movimentacao_estoque: {
        Row: {
          created_at: string | null
          id: string
          motivo: string
          observacoes: string | null
          produto_id: string | null
          quantidade: number
          tipo: string
          usuario_id: string | null
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          motivo: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade: number
          tipo: string
          usuario_id?: string | null
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          motivo?: string
          observacoes?: string | null
          produto_id?: string | null
          quantidade?: number
          tipo?: string
          usuario_id?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacao_estoque_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo_barras: string | null
          created_at: string | null
          descricao: string | null
          estoque: number
          estoque_minimo: number
          id: string
          imagem: string | null
          marca: string
          nome: string
          preco: number
          preco_custo: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo_barras?: string | null
          created_at?: string | null
          descricao?: string | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          marca: string
          nome: string
          preco: number
          preco_custo?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo_barras?: string | null
          created_at?: string | null
          descricao?: string | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          marca?: string
          nome?: string
          preco?: number
          preco_custo?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          document_number: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          document_number?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          document_number?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rated_id: string
          rater_id: string
          rating: number
          ride_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_id: string
          rater_id: string
          rating: number
          ride_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          destination_address: string
          destination_latitude: number
          destination_longitude: number
          driver_id: string | null
          estimated_distance: number | null
          estimated_duration: number | null
          id: string
          patient_id: string
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          rating: number | null
          rating_comment: string | null
          requested_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["ride_status"]
        }
        Insert: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          destination_address: string
          destination_latitude: number
          destination_longitude: number
          driver_id?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          patient_id: string
          pickup_address: string
          pickup_latitude: number
          pickup_longitude: number
          rating?: number | null
          rating_comment?: string | null
          requested_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Update: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          destination_address?: string
          destination_latitude?: number
          destination_longitude?: number
          driver_id?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          patient_id?: string
          pickup_address?: string
          pickup_latitude?: number
          pickup_longitude?: number
          rating?: number | null
          rating_comment?: string | null
          requested_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria: Database["public"]["Enums"]["servico_categoria"]
          created_at: string | null
          duracao: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["servico_categoria"]
          created_at?: string | null
          duracao: number
          id?: string
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["servico_categoria"]
          created_at?: string | null
          duracao?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      templates_mensagem: {
        Row: {
          assunto: string | null
          ativo: boolean | null
          created_at: string | null
          id: string
          mensagem: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          assunto?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          mensagem: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          assunto?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          mensagem?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          desconto: number | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          status: string
          total: number
          total_final: number
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          total: number
          total_final: number
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          total?: number
          total_final?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_config: {
        Row: {
          api_key: string | null
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          id: string
          nome: string
          status: string | null
          telefone: string
          ultimo_ping: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone: string
          ultimo_ping?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string
          ultimo_ping?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agendamento_status: "livre" | "pendente" | "ocupado" | "cancelado"
      ride_status:
        | "requested"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      servico_categoria:
        | "corte"
        | "coloracao"
        | "tratamento"
        | "finalizacao"
        | "outros"
      user_type: "patient" | "driver" | "admin"
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
      agendamento_status: ["livre", "pendente", "ocupado", "cancelado"],
      ride_status: [
        "requested",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      servico_categoria: [
        "corte",
        "coloracao",
        "tratamento",
        "finalizacao",
        "outros",
      ],
      user_type: ["patient", "driver", "admin"],
    },
  },
} as const
