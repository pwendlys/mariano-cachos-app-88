
-- Permitir UPLOAD público somente para o bucket 'banner' nas pastas permitidas
CREATE POLICY "Public can upload banner backgrounds and logos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'banner'
  AND (name LIKE 'backgrounds/%' OR name LIKE 'logos/%')
);

-- Permitir UPDATE público (necessário quando usar upsert: true)
CREATE POLICY "Public can update banner backgrounds and logos"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'banner'
  AND (name LIKE 'backgrounds/%' OR name LIKE 'logos/%')
)
WITH CHECK (
  bucket_id = 'banner'
  AND (name LIKE 'backgrounds/%' OR name LIKE 'logos/%')
);
