-- Zonas estandar para clientes y vendedores
-- Opciones: LA VEGA, SANTIAGO, PUERTO PLATA, MOCA

begin;

-- 1) clientes.area
alter table public.clientes
  add column if not exists area text;

-- 2) normalizar datos existentes
update public.clientes
set area = case
  when upper(trim(coalesce(area, direccion, ''))) in ('LA VEGA', 'VEGA') then 'LA VEGA'
  when upper(trim(coalesce(area, direccion, ''))) in ('SANTIAGO') then 'SANTIAGO'
  when upper(trim(coalesce(area, direccion, ''))) in ('PUERTO PLATA') then 'PUERTO PLATA'
  when upper(trim(coalesce(area, direccion, ''))) in ('MOCA') then 'MOCA'
  else null
end
where area is null
   or upper(trim(area)) not in ('LA VEGA', 'SANTIAGO', 'PUERTO PLATA', 'MOCA');

-- Mantiene direccion consistente con area (compatibilidad con flujos viejos)
update public.clientes
set direccion = area
where area in ('LA VEGA', 'SANTIAGO', 'PUERTO PLATA', 'MOCA')
  and coalesce(direccion, '') <> area;

-- 3) constraint en clientes.area
alter table public.clientes
  drop constraint if exists clientes_area_check;

alter table public.clientes
  add constraint clientes_area_check
  check (
    area is null
    or upper(trim(area)) in ('LA VEGA', 'SANTIAGO', 'PUERTO PLATA', 'MOCA')
  );

create index if not exists clientes_area_idx on public.clientes (area);

-- 4) usuarios.area (si existe columna area)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'usuarios'
      and column_name = 'area'
  ) then
    execute '
      update public.usuarios
      set area = case
        when upper(trim(coalesce(area, ''''))) in (''LA VEGA'', ''VEGA'') then ''LA VEGA''
        when upper(trim(coalesce(area, ''''))) in (''SANTIAGO'') then ''SANTIAGO''
        when upper(trim(coalesce(area, ''''))) in (''PUERTO PLATA'') then ''PUERTO PLATA''
        when upper(trim(coalesce(area, ''''))) in (''MOCA'') then ''MOCA''
        else null
      end
    ';

    execute 'alter table public.usuarios drop constraint if exists usuarios_area_check';
    execute '
      alter table public.usuarios
      add constraint usuarios_area_check
      check (
        area is null
        or upper(trim(area)) in (''LA VEGA'', ''SANTIAGO'', ''PUERTO PLATA'', ''MOCA'')
      )
    ';
  end if;
end $$;

commit;

-- OPCIONAL (recomendado para enforcement real):
-- Habilitar RLS en public.clientes y crear politicas por rol/area.
-- Hazlo en una migracion aparte si hoy no tienes RLS configurado.
