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
          cliente_id: string
          created_at: string
          data: string
          horario: string
          id: string
          observacoes: string | null
          servico_id: string
          status: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          servico_id: string
          status?: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          servico_id?: string
          status?: string
          updated_at?: string
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
          created_at: string
          email: string
          endereco: string | null
          id: string
          nome: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          endereco?: string | null
          id?: string
          nome: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      cobrancas: {
        Row: {
          created_at: string
          data_entrega: string | null
          data_envio: string | null
          data_leitura: string | null
          divida_id: string
          erro: string | null
          id: string
          mensagem: string | null
          resposta: string | null
          status: string
          tentativa: number
          tipo: string
        }
        Insert: {
          created_at?: string
          data_entrega?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          divida_id: string
          erro?: string | null
          id?: string
          mensagem?: string | null
          resposta?: string | null
          status?: string
          tentativa?: number
          tipo: string
        }
        Update: {
          created_at?: string
          data_entrega?: string | null
          data_envio?: string | null
          data_leitura?: string | null
          divida_id?: string
          erro?: string | null
          id?: string
          mensagem?: string | null
          resposta?: string | null
          status?: string
          tentativa?: number
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
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      dividas: {
        Row: {
          created_at: string
          data_inclusao: string
          data_vencimento: string
          descricao: string
          devedor_id: string
          id: string
          observacoes: string | null
          status: string
          updated_at: string
          valor_atual: number
          valor_original: number
        }
        Insert: {
          created_at?: string
          data_inclusao?: string
          data_vencimento: string
          descricao: string
          devedor_id: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
          valor_atual: number
          valor_original: number
        }
        Update: {
          created_at?: string
          data_inclusao?: string
          data_vencimento?: string
          descricao?: string
          devedor_id?: string
          id?: string
          observacoes?: string | null
          status?: string
          updated_at?: string
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
      itens_venda: {
        Row: {
          created_at: string
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
          venda_id?: string
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
      movimentacao_estoque: {
        Row: {
          created_at: string
          id: string
          motivo: string | null
          produto_id: string
          quantidade: number
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id: string
          quantidade: number
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          motivo?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          estoque: number
          estoque_minimo: number
          id: string
          imagem: string | null
          marca: string
          nome: string
          preco: number
          preco_custo: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          marca: string
          nome: string
          preco: number
          preco_custo?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          marca?: string
          nome?: string
          preco?: number
          preco_custo?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string
          duracao: number
          id: string
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string
          duracao: number
          id?: string
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string
          duracao?: number
          id?: string
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string
          email: string
          id: string
          nome: string
          senha: string
          tipo: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          email: string
          id?: string
          nome: string
          senha: string
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          senha?: string
          tipo?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_venda: string
          id: string
          status: string
          total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_venda?: string
          id?: string
          status?: string
          total: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_venda?: string
          id?: string
          status?: string
          total?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
