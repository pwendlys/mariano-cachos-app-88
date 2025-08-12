
do $$
begin
  -- Tenta promover a linha existente para admin e ativo
  update public.usuarios
     set tipo = 'admin',
         ativo = true,
         updated_at = now()
   where email = 'wendlyspatrick@gmail.com';

  -- Se não houver linha afetada, cria um registro admin para esse email
  if not found then
    insert into public.usuarios (nome, email, whatsapp, senha, tipo, ativo, created_at, updated_at)
    values ('Administrador', 'wendlyspatrick@gmail.com', '', 'temp@123', 'admin', true, now(), now());
  end if;
end $$;
