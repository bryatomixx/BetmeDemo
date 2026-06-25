-- Dirección del mensaje: 'in' = recibido del paciente, 'out' = enviado por el hospital.
alter table public.wa_messages
  add column if not exists direccion text not null default 'in';
