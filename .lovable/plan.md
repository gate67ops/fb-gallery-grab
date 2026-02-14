

## Encrypt Facebook OAuth Tokens at Rest

### Overview
Facebook access tokens are currently stored as plaintext in the database. This plan adds symmetric encryption using PostgreSQL's `pgcrypto` extension so tokens are encrypted at rest and only decrypted server-side in backend functions.

### Step-by-Step

**Step 1: Add the `TOKEN_ENCRYPTION_KEY` secret**
- Request a new secret from you via the secrets tool
- You will paste in a strong passphrase (any random string works)

**Step 2: Database migration**
- Enable `pgcrypto` extension
- Add `encrypted_access_token` (bytea) column to `facebook_tokens`
- Create two database functions:
  - `store_facebook_token(...)` -- encrypts the token and upserts
  - `get_facebook_token(p_user_id, p_encryption_key)` -- decrypts and returns the token + expiry
- Migrate any existing plaintext tokens (encrypted with a temporary key that will be replaced on next login)
- Make `access_token` column nullable (keep for migration safety, drop later)

**Step 3: Update `facebook-oauth-callback` edge function**
- After receiving the Facebook access token, call `store_facebook_token` RPC with the encryption key from the `TOKEN_ENCRYPTION_KEY` secret
- Remove the direct `upsert` into `facebook_tokens`

**Step 4: Update `fetch-facebook-photos` edge function**
- Call `get_facebook_token` RPC to retrieve the decrypted token instead of reading plaintext from the table
- Remove the direct `select` from `facebook_tokens`

**Step 5: Update frontend hook (`useFacebookPhotos.ts`)**
- Remove direct database reads of `facebook_tokens` from the client
- The edge function already has the user's JWT and will fetch the token server-side
- Simplify `fetchPhotos` and `loadMore` to just call the edge function without passing `provider_token`

### Technical Details

**Encryption:** `pgp_sym_encrypt(token, key)` / `pgp_sym_decrypt(encrypted, key)` from `pgcrypto`. The key is stored as a backend secret and passed to RPC functions from edge functions only.

**RPC functions** are `SECURITY DEFINER` with `search_path` locked to `public`. They accept the encryption key as a parameter (from edge functions using the service role key), so the key never lives in the database.

**Security improvement:** The plaintext token is no longer readable from the client or the database. Only the backend functions can decrypt it, and only when called with a valid user JWT.

**Files changed:**
- New database migration (pgcrypto, column, RPC functions)
- `supabase/functions/facebook-oauth-callback/index.ts`
- `supabase/functions/fetch-facebook-photos/index.ts`
- `src/hooks/useFacebookPhotos.ts`
- New secret: `TOKEN_ENCRYPTION_KEY`

