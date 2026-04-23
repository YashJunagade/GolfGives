-- ============================================================
-- Seed: Sample charities for development/testing
-- ============================================================

insert into public.charities (name, description, image_url, website, featured, active) values
  ('Cancer Research UK',     'Funding life-saving research into all types of cancer.',         null, 'https://www.cancerresearchuk.org', true,  true),
  ('British Heart Foundation','Fighting heart and circulatory diseases through research.',     null, 'https://www.bhf.org.uk',           false, true),
  ('Age UK',                 'Supporting older people to live well and independently.',         null, 'https://www.ageuk.org.uk',         false, true),
  ('Macmillan Cancer Support','Providing medical, emotional and financial support for cancer.',null, 'https://www.macmillan.org.uk',     false, true),
  ('RNLI',                   'Saving lives at sea with lifeboat crews across the UK.',         null, 'https://rnli.org',                 false, true);
