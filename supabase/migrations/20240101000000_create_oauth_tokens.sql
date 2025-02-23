create table oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  access_token text not null,
  refresh_token text not null,
  token_type text,
  scope text,
  expires_in integer,
  created_at timestamptz not null default now()
);

create index idx_oauth_tokens_email on oauth_tokens (email);
create index idx_oauth_tokens_created_at on oauth_tokens (created_at); 