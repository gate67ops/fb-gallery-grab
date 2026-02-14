

## Encrypt Facebook OAuth Tokens at Rest

### Problem
Facebook access tokens are stored as plaintext in the `facebook_tokens.access_token` column. If the database were compromised, these tokens would be immediately usable.

### Solution
Use PostgreSQL's `pgcrypto` extension with symmetric encryption (`pgp_sym_encrypt` / `pgp_sym_decrypt`) to encrypt tokens before storage and decrypt them only when needed in edge functions.

### Changes

**1. Database Migration**
- Enable the `pgcrypto` extension
- Add a new `encrypted_access_token` column (bytea) to `facebook_tokens`
- Migrate any existing plaintext tokens to encrypted form using a server-side key
- Drop the old `access_token` (text) column after migration

**2. Add Encryption Key Secret**
- Generate a strong encryption passphrase and store it as a backend secret (`TOKEN_ENCRYPTION_KEY`)
- This key will only be accessible to edge functions, never exposed to the client

**3. Update `facebook-oauth-callback` Edge Function**
- After receiving the Facebook access token, encrypt it before inserting into the database:
  ```
  pgp_sym_encrypt(token, encryption_key)
  ```
- Use a Supabase RPC function to handle the encryption server-side

**4. Update `fetch-facebook-photos` Edge Function**
- When reading the token, decrypt it before using it to call the Facebook API
- Use a Supabase RPC function to handle the decryption server-side

**5. Create Two Database Functions (RPC)**
- `store_facebook_token(p_user_id, p_access_token, p_expires_at, p_facebook_user_id)` -- encrypts and upserts
- `get_facebook_token(p_user_id)` -- decrypts and returns the token
- Both functions will be `SECURITY DEFINER` with `search_path` locked to `public`, and will read the encryption key from a Vault secret or a dedicated config

### Technical Details

**Encryption approach:** Use `pgp_sym_encrypt`/`pgp_sym_decrypt` from `pgcrypto`. The encryption key is stored as a backend secret (`TOKEN_ENCRYPTION_KEY`) and passed to the RPC functions as a parameter from edge functions (which have access to secrets). This avoids storing the key in the database itself.

**RPC functions** ensure the plaintext token never travels through the client -- edge functions call them with the service role key.

**Migration path:**
1. Add `encrypted_access_token` column
2. Encrypt existing tokens via a one-time migration using a default key
3. Drop the plaintext `access_token` column
4. Update both edge functions to use the new RPC functions

### Files Modified
- `supabase/functions/facebook-oauth-callback/index.ts` -- use `store_facebook_token` RPC instead of direct upsert
- `supabase/functions/fetch-facebook-photos/index.ts` -- use `get_facebook_token` RPC instead of direct select
- `src/hooks/useFacebookPhotos.ts` -- remove direct token reads (delegate entirely to edge function)
- New database migration for pgcrypto, new columns, and RPC functions
- New secret: `TOKEN_ENCRYPTION_KEY`

