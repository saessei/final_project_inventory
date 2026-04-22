create or replace function public.truncate_all_tables()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  table_list text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
  into table_list
  from pg_tables
  where schemaname = 'public';

  if table_list is null then
    return;
  end if;

  execute 'truncate table ' || table_list || ' restart identity cascade';
end;
$$;

revoke all on function public.truncate_all_tables() from public;
grant execute on function public.truncate_all_tables() to service_role;
