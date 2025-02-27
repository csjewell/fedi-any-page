  CREATE TABLE IF NOT EXISTS users (
    username_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL
  ) STRICT;

  -- I'll have to check what it does
  CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    username_id INTEGER NOT NULL REFERENCES users(username_id),
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id TEXT NOT NULL REFERENCES documents(document_id),
    CONSTRAINT c_followers_message_id UNIQUE (message_id)
  ) STRICT;

  -- actor follows username
  CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    username_id INTEGER NOT NULL REFERENCES users(username_id),
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    accepted INT NOT NULL CHECK (accepted > -1) CHECK (accepted < 2) DEFAULT 0,
    ignored INT NOT NULL CHECK (ignored > -1) CHECK (ignored < 2) DEFAULT 0,
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id TEXT NOT NULL REFERENCES documents(document_id),
    CONSTRAINT c_followers_message_id UNIQUE (message_id)
  ) STRICT;

  -- username follows actor
  CREATE TABLE IF NOT EXISTS following (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    username_id INTEGER NOT NULL REFERENCES users(username_id),
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id TEXT NOT NULL REFERENCES documents(document_id),
    CONSTRAINT c_followers_message_id UNIQUE (message_id)
  ) STRICT;

  -- actor likes document (or reply)
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liked_id TEXT NOT NULL,
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    document_id TEXT NOT NULL REFERENCES documents(document_id), -- Store the actual document in documents to be archived.
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ) STRICT;

  -- note by actor is a reply to (my?) document
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    document_id TEXT NOT NULL REFERENCES documents(document_id), -- Store the actual document in documents to be archived.
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ) STRICT;

  -- store all actors
  CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL,
    username_id INTEGER REFERENCES users(username_id), -- if this actor is a local user.
    created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    inbox TEXT,
    outbox TEXT,
    CONSTRAINT c_actors_actor_id UNIQUE (actor_id)
  ) STRICT;

  -- store documents
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    document_id TEXT NOT NULL,
    created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    type TEXT NOT NULL,
    url TEXT, -- for MY documents
    document BLOB, -- for other peoples documents
    r2_key TEXT, -- for other peoples documents that are in storage
    r2_index INTEGER,
    CONSTRAINT c_documents_document_id UNIQUE (actor_id)
  )

  CREATE TABLE IF NOT EXISTS version (
    major INT PRIMARY KEY,
    minor INT
  ) WITHOUT ROWID;

  CREATE INDEX idx_followers_get ON followers(username,accepted,private,created);

