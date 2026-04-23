-- ============================================================
-- Storage bucket for winner proof uploads
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proofs');

-- Allow public read so admin can view proof images
CREATE POLICY "Public can read proofs"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'proofs');

-- Allow users to overwrite their own uploads (upsert)
CREATE POLICY "Authenticated users can update proofs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proofs');
