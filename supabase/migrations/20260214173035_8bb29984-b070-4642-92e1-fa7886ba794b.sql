
-- Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Add encrypted column
ALTER TABLE public.facebook_tokens
ADD COLUMN encrypted_access_token bytea;

-- Make plaintext column nullable for migration safety
ALTER TABLE public.facebook_tokens
ALTER COLUMN access_token DROP NOT NULL;

-- Function to store an encrypted token
CREATE OR REPLACE FUNCTION public.store_facebook_token(
  p_user_id uuid,
  p_access_token text,
  p_encryption_key text,
  p_expires_at timestamptz DEFAULT NULL,
  p_facebook_user_id text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.facebook_tokens (user_id, access_token, encrypted_access_token, expires_at, facebook_user_id, updated_at)
  VALUES (
    p_user_id,
    '', -- empty plaintext
    extensions.pgp_sym_encrypt(p_access_token, p_encryption_key),
    p_expires_at,
    p_facebook_user_id,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    access_token = '',
    encrypted_access_token = extensions.pgp_sym_encrypt(p_access_token, p_encryption_key),
    expires_at = p_expires_at,
    facebook_user_id = p_facebook_user_id,
    updated_at = now();
END;
$$;

-- Function to retrieve a decrypted token
CREATE OR REPLACE FUNCTION public.get_facebook_token(
  p_user_id uuid,
  p_encryption_key text
)
RETURNS TABLE(access_token text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN ft.encrypted_access_token IS NOT NULL THEN
        extensions.pgp_sym_decrypt(ft.encrypted_access_token, p_encryption_key)
      ELSE
        ft.access_token
    END AS access_token,
    ft.expires_at
  FROM public.facebook_tokens ft
  WHERE ft.user_id = p_user_id;
END;
$$;

-- Add unique constraint on user_id if not exists (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'facebook_tokens_user_id_key'
  ) THEN
    ALTER TABLE public.facebook_tokens ADD CONSTRAINT facebook_tokens_user_id_key UNIQUE (user_id);
  END IF;
END $$;
