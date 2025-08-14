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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abacate_config: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          chave_pix: string | null
          chave_pix_abacate: string | null
          cliente_id: string
          comprovante_pix: string | null
          created_at: string
          data: string
          horario: string
          id: string
          observacoes: string | null
          profissional_id: string | null
          qr_code_data: string | null
          servico_id: string
          status: string
          status_cobranca: string | null
          status_pagamento: string | null
          transaction_id: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          chave_pix?: string | null
          chave_pix_abacate?: string | null
          cliente_id: string
          comprovante_pix?: string | null
          created_at?: string
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          profissional_id?: string | null
          qr_code_data?: string | null
          servico_id: string
          status?: string
          status_cobranca?: string | null
          status_pagamento?: string | null
          transaction_id?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          chave_pix?: string | null
          chave_pix_abacate?: string | null
          cliente_id?: string
          comprovante_pix?: string | null
          created_at?: string
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          profissional_id?: string | null
          qr_code_data?: string | null
          servico_id?: string
          status?: string
          status_cobranca?: string | null
          status_pagamento?: string | null
          transaction_id?: string | null
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
      banner_settings: {
        Row: {
          created_at: string
          description: string
          id: string
          image_meta: Json
          image_url: string | null
          is_visible: boolean
          logo_meta: Json
          logo_url: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          image_meta?: Json
          image_url?: string | null
          is_visible?: boolean
          logo_meta?: Json
          logo_url?: string | null
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_meta?: Json
          image_url?: string | null
          is_visible?: boolean
          logo_meta?: Json
          logo_url?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
          divida_id: string | null
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
          divida_id?: string | null
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
          divida_id?: string | null
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
      comissoes: {
        Row: {
          created_at: string
          data_referencia: string
          id: string
          observacoes: string | null
          origem_id: string
          percentual_comissao: number
          profissional_id: string
          status: string
          tipo_origem: string
          updated_at: string
          valor_base: number
          valor_comissao: number
        }
        Insert: {
          created_at?: string
          data_referencia: string
          id?: string
          observacoes?: string | null
          origem_id: string
          percentual_comissao: number
          profissional_id: string
          status?: string
          tipo_origem: string
          updated_at?: string
          valor_base: number
          valor_comissao: number
        }
        Update: {
          created_at?: string
          data_referencia?: string
          id?: string
          observacoes?: string | null
          origem_id?: string
          percentual_comissao?: number
          profissional_id?: string
          status?: string
          tipo_origem?: string
          updated_at?: string
          valor_base?: number
          valor_comissao?: number
        }
        Relationships: []
      }
      configuracoes_comissao: {
        Row: {
          ativo: boolean | null
          categoria_servico: string | null
          created_at: string
          id: string
          profissional_id: string
          tipo_comissao: string
          updated_at: string
          valor_comissao: number
        }
        Insert: {
          ativo?: boolean | null
          categoria_servico?: string | null
          created_at?: string
          id?: string
          profissional_id: string
          tipo_comissao: string
          updated_at?: string
          valor_comissao: number
        }
        Update: {
          ativo?: boolean | null
          categoria_servico?: string | null
          created_at?: string
          id?: string
          profissional_id?: string
          tipo_comissao?: string
          updated_at?: string
          valor_comissao?: number
        }
        Relationships: []
      }
      cupons: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          limite_uso: number | null
          tipo: string
          updated_at: string | null
          usos_realizados: number | null
          valor: number
          valor_minimo_compra: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          data_fim: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          tipo: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor: number
          valor_minimo_compra?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          limite_uso?: number | null
          tipo?: string
          updated_at?: string | null
          usos_realizados?: number | null
          valor?: number
          valor_minimo_compra?: number | null
        }
        Relationships: []
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
      fluxo_caixa: {
        Row: {
          categoria: string
          cliente_nome: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          metadata: Json | null
          origem_id: string | null
          origem_tipo: string | null
          profissional_nome: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          cliente_nome?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          metadata?: Json | null
          origem_id?: string | null
          origem_tipo?: string | null
          profissional_nome?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          cliente_nome?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          metadata?: Json | null
          origem_id?: string | null
          origem_tipo?: string | null
          profissional_nome?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      gallery_photos: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      historico_atendimentos: {
        Row: {
          agendamento_id: string | null
          cliente_id: string | null
          created_at: string
          data_atendimento: string | null
          id: string
          observacoes: string | null
          produtos_vendidos: Json | null
          servicos_extras: Json | null
          status: string | null
          updated_at: string
          valor_produtos: number | null
          valor_servicos_extras: number | null
        }
        Insert: {
          agendamento_id?: string | null
          cliente_id?: string | null
          created_at?: string
          data_atendimento?: string | null
          id?: string
          observacoes?: string | null
          produtos_vendidos?: Json | null
          servicos_extras?: Json | null
          status?: string | null
          updated_at?: string
          valor_produtos?: number | null
          valor_servicos_extras?: number | null
        }
        Update: {
          agendamento_id?: string | null
          cliente_id?: string | null
          created_at?: string
          data_atendimento?: string | null
          id?: string
          observacoes?: string | null
          produtos_vendidos?: Json | null
          servicos_extras?: Json | null
          status?: string | null
          updated_at?: string
          valor_produtos?: number | null
          valor_servicos_extras?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_atendimentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_atendimentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      notificacoes: {
        Row: {
          created_at: string | null
          data_criacao: string | null
          id: string
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_criacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_criacao?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo_barras: string | null
          created_at: string
          descricao: string | null
          em_destaque: boolean | null
          estoque: number
          estoque_minimo: number
          id: string
          imagem: string | null
          imagem_banner: string | null
          marca: string
          nome: string
          ordem_destaque: number | null
          preco: number
          preco_custo: number | null
          tipo_produto: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          em_destaque?: boolean | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          imagem_banner?: string | null
          marca: string
          nome: string
          ordem_destaque?: number | null
          preco: number
          preco_custo?: number | null
          tipo_produto?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo_barras?: string | null
          created_at?: string
          descricao?: string | null
          em_destaque?: boolean | null
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem?: string | null
          imagem_banner?: string | null
          marca?: string
          nome?: string
          ordem_destaque?: number | null
          preco?: number
          preco_custo?: number | null
          tipo_produto?: string
          updated_at?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          ativo: boolean | null
          avatar: string | null
          created_at: string
          email: string
          especialidades: string[] | null
          id: string
          nome: string
          percentual_comissao_padrao: number | null
          telefone: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          avatar?: string | null
          created_at?: string
          email: string
          especialidades?: string[] | null
          id?: string
          nome: string
          percentual_comissao_padrao?: number | null
          telefone: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          avatar?: string | null
          created_at?: string
          email?: string
          especialidades?: string[] | null
          id?: string
          nome?: string
          percentual_comissao_padrao?: number | null
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      saldos_clientes: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_cobranca: string | null
          id: string
          saldo_devedor: number | null
          total_pago: number | null
          total_produtos: number | null
          total_servicos: number | null
          ultima_atualizacao: string | null
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_cobranca?: string | null
          id?: string
          saldo_devedor?: number | null
          total_pago?: number | null
          total_produtos?: number | null
          total_servicos?: number | null
          ultima_atualizacao?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_cobranca?: string | null
          id?: string
          saldo_devedor?: number | null
          total_pago?: number | null
          total_produtos?: number | null
          total_servicos?: number | null
          ultima_atualizacao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saldos_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string
          duracao: number
          id: string
          imagem: string | null
          nome: string
          preco: number
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string
          duracao: number
          id?: string
          imagem?: string | null
          nome: string
          preco: number
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string
          duracao?: number
          id?: string
          imagem?: string | null
          nome?: string
          preco?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
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
          avatar_url?: string | null
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
          avatar_url?: string | null
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
          chave_pix: string | null
          chave_pix_abacate: string | null
          cliente_id: string | null
          created_at: string
          cupom_id: string | null
          data_venda: string
          desconto: number | null
          forma_pagamento: string | null
          id: string
          profissional_id: string | null
          qr_code_data: string | null
          status: string
          status_pagamento: string | null
          total: number
          total_final: number
          transaction_id: string | null
        }
        Insert: {
          chave_pix?: string | null
          chave_pix_abacate?: string | null
          cliente_id?: string | null
          created_at?: string
          cupom_id?: string | null
          data_venda?: string
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          profissional_id?: string | null
          qr_code_data?: string | null
          status?: string
          status_pagamento?: string | null
          total: number
          total_final: number
          transaction_id?: string | null
        }
        Update: {
          chave_pix?: string | null
          chave_pix_abacate?: string | null
          cliente_id?: string | null
          created_at?: string
          cupom_id?: string | null
          data_venda?: string
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          profissional_id?: string | null
          qr_code_data?: string | null
          status?: string
          status_pagamento?: string | null
          total?: number
          total_final?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_cupom_id_fkey"
            columns: ["cupom_id"]
            isOneToOne: false
            referencedRelation: "cupons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
