CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ts            INTEGER NOT NULL,
  path          TEXT    NOT NULL,
  query         TEXT,
  method        TEXT,
  event_type    TEXT    NOT NULL,
  target_url    TEXT,
  referrer      TEXT,
  ip            TEXT,
  asn           INTEGER,
  org           TEXT,
  country       TEXT,
  region        TEXT,
  region_code   TEXT,
  city          TEXT,
  postal_code   TEXT,
  latitude      TEXT,
  longitude     TEXT,
  timezone      TEXT,
  is_eu         INTEGER,
  colo          TEXT,
  user_agent    TEXT,
  accept_lang   TEXT,
  http_protocol TEXT,
  tls_version   TEXT,
  trust_score   INTEGER,
  dnt           INTEGER,
  session_id    TEXT,
  is_new_session INTEGER
);

CREATE INDEX IF NOT EXISTS idx_ts   ON events(ts);
CREATE INDEX IF NOT EXISTS idx_type ON events(event_type, ts);
CREATE INDEX IF NOT EXISTS idx_path ON events(path, ts);

CREATE TABLE IF NOT EXISTS agg_daily (
  date   TEXT    NOT NULL,
  path   TEXT    NOT NULL,
  pv     INTEGER DEFAULT 0,
  uv     INTEGER DEFAULT 0,
  PRIMARY KEY (date, path)
);

CREATE TABLE IF NOT EXISTS agg_referrer (
  date   TEXT    NOT NULL,
  source TEXT    NOT NULL,
  count  INTEGER DEFAULT 0,
  PRIMARY KEY (date, source)
);

CREATE TABLE IF NOT EXISTS agg_geo (
  date    TEXT    NOT NULL,
  country TEXT    NOT NULL,
  region  TEXT    NOT NULL DEFAULT '',
  count   INTEGER DEFAULT 0,
  PRIMARY KEY (date, country, region)
);

CREATE TABLE IF NOT EXISTS agg_org (
  date  TEXT    NOT NULL,
  org   TEXT    NOT NULL,
  asn   INTEGER,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, org)
);

CREATE TABLE IF NOT EXISTS agg_page_visits (
  date  TEXT    NOT NULL,
  page  TEXT    NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, page)
);

CREATE TABLE IF NOT EXISTS agg_link_clicks (
  date       TEXT    NOT NULL,
  target_url TEXT    NOT NULL,
  count      INTEGER DEFAULT 0,
  PRIMARY KEY (date, target_url)
);

CREATE TABLE IF NOT EXISTS agg_lang (
  date  TEXT    NOT NULL,
  lang  TEXT    NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (date, lang)
);

CREATE TABLE IF NOT EXISTS url_labels (
  target_url TEXT PRIMARY KEY,
  label      TEXT NOT NULL
);

INSERT OR IGNORE INTO url_labels VALUES
  ('https://doi.org/10.1021/acs.est.5c11071', 'eDNA Tracers ES&T'),
  ('https://doi.org/10.1016/j.xinn.2023.100389', 'Superhydrophobic The Innovation'),
  ('https://papers.cumincad.org/cgi-bin/works/paper/acadia24_v1_14', 'PolyTile ACADIA'),
  ('https://www.cell.com/the-innovation/fulltext/S2666-6758(23)00017-6?_returnURL=https%3A%2F%2Flinkinghub.elsevier.com%2Fretrieve%2Fpii%2FS2666675823000176%3Fshowall%3Dtrue', 'Superhydrophobic Full Text'),
  ('https://patentimages.storage.googleapis.com/23/c1/2e/ae5d7a7ba0f149/US11839998.pdf', 'US Patent Crack Engineering'),
  ('https://patents.google.com/patent/CN107903925A/en', 'CN Patent Biomass Reactor'),
  ('https://github.com/AlbanLi0314/er-companion', 'ER Companion GitHub'),
  ('https://github.com/AlbanLi0314/resonance', 'Resonance GitHub'),
  ('https://resonance-aounkapvlodwxrz2n49wye.streamlit.app', 'Resonance Demo'),
  ('https://echo-app-ebon.vercel.app', 'Echo Demo'),
  ('https://www.sabinlab.com/polytile', 'PolyTile Project Page'),
  ('https://www.youtube.com/watch?v=sfNbcSTc1aE', 'ER Companion Software Demo'),
  ('https://www.youtube.com/watch?v=PdG9uu5Dodc', 'ER Companion Hardware Demo'),
  ('/cv/Alban_Resume_AI.pdf', 'CV AI PDF'),
  ('/cv/Alban_Resume_AI.docx', 'CV AI Word'),
  ('/cv/Alban_ATS_AI.docx', 'CV AI ATS'),
  ('/cv/Alban_Resume_M.pdf', 'CV Materials PDF'),
  ('/cv/Alban_Resume_M.docx', 'CV Materials Word'),
  ('/cv/Alban_ATS_M.docx', 'CV Materials ATS'),
  ('/cv/Alban_Resume_B.pdf', 'CV Biotech PDF'),
  ('/cv/Alban_Resume_B.docx', 'CV Biotech Word'),
  ('/cv/Alban_ATS_B.docx', 'CV Biotech ATS');
