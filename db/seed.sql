USE inventory_db;

INSERT INTO items (name, sku, category, status, quantity, supplier, location, updated, notes) VALUES
('Steel Hammer',        'TL-1001', 'Tools',        'Active',   42,  'ForgeWorks',   'Aisle A / Bin 12',   '2026-02-05', 'General-purpose 16oz claw hammer.'),
('Cordless Drill',      'PT-2104', 'Power Tools',  'Error',     7,  'VoltEdge',     'Aisle B / Shelf 4',  '2026-02-03', '18V drill kit. Reorder recommended.'),
('Safety Glasses',      'SF-3308', 'Safety',       'Active',  128,  'SafeLine',     'Aisle D / Rack 2',   '2026-01-30', 'Anti-fog coated lenses.'),
('Industrial Gloves',   'SF-4412', 'Safety',       'Inactive',  0,  'SafeLine',     'Aisle D / Rack 5',   '2026-02-01', 'Awaiting incoming shipment.'),
('Paint Marker Set',    'CS-5015', 'Consumables',  'Active',   23,  'MarkRight',    'Aisle C / Drawer 7', '2026-02-02', 'Used for warehouse labeling.'),
('Wire Stripper',       'TL-1042', 'Tools',        'Active',   15,  'ForgeWorks',   'Aisle A / Bin 9',    '2026-02-10', 'Adjustable gauge wire stripper.'),
('Extension Cord 25ft', 'EL-3301', 'Electrical',   'Active',   30,  'PowerLine Co', 'Aisle E / Shelf 1',  '2026-01-28', 'Heavy duty 12 AWG.'),
('Safety Vest',         'SF-5501', 'Safety',       'Active',   60,  'SafeLine',     'Aisle D / Rack 1',   '2026-02-08', 'High-visibility orange, size L.'),
('Zip Ties (100pk)',    'CS-6010', 'Consumables',  'Active',   85,  'BindRight',    'Aisle C / Bin 3',    '2026-02-06', 'Black, 8 inch, 50lb tensile.'),
('Angle Grinder',       'PT-2210', 'Power Tools',  'Inactive',  2,  'VoltEdge',     'Aisle B / Shelf 6',  '2026-01-25', 'Awaiting repair. Do not issue.');
