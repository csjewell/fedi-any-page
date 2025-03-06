/* SPDX */
import * as Kit from '@csjewell-activitypub/general'
import { NotImplementedError } from '@csjewell-activitypub/general/errors'
import type { Database } from '@csjewell-activitypub/general/database/handler'
import type { DatabaseRouter, DBDocument } from '@csjewell-activitypub/general/database/router'
import * as AP from '@csjewell-activitypub/types'
import { DatabaseSync } from 'node:sqlite'

// https://docs.deno.com/examples/sqlite/

class LocalDB implements DatabaseRouter {
  private handle: DatabaseSync

  constructor() {
    this.handle = new DatabaseSync('ap.sqlite.db')
    this.init()
  }

  init(): void {
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    active INT NOT NULL CHECK (active > -1) CHECK (active < 2) DEFAULT 1,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    homepage TEXT,
    summary TEXT,
    at_protocol_id TEXT,
    key_id INTEGER REFERENCES keys(id),
    is_admin INT NOT NULL CHECK (is_admin > -1) CHECK (is_admin < 2) DEFAULT 0
  ) STRICT
    `)

    // Keys used on users/actors
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL,
    expired INT NOT NULL CHECK (expired > -1) CHECK (expired < 2) DEFAULT 0
  ) STRICT;
    `)

    // Notes saved on our documents
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS reply_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    username_id INTEGER NOT NULL REFERENCES users(username_id),
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id INT REFERENCES documents(document_id),
    CONSTRAINT c_notes_message_id UNIQUE (message_id)
  ) STRICT;
    `)

    // actor follows username
    this.handle.exec(`
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
    `)

    // username follows actor
    this.handle.exec(`
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
    `)

    // actor likes document (or reply)
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liked_id TEXT NOT NULL,
    actor_id INTEGER NOT NULL REFERENCES actors (id),
    document_id INTEGER NOT NULL REFERENCES documents(id), -- Store the actual document in documents to be archived.
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;
    `)

    // note by actor is a reply to (my?) document
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id TEXT NOT NULL REFERENCES actors (actor_id),
    document_id TEXT NOT NULL REFERENCES documents(document_id), -- Store the actual document in documents to be archived.
    private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
    deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
    created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;
    `)

    // store all actors
    this.handle.exec(`
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
    `)

    // store documents
    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    document_id TEXT NOT NULL,
    created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    url TEXT, -- for MY documents
    document BLOB, -- for other peoples documents
    r2_key TEXT, -- for other peoples documents that are in storage
    r2_index INTEGER,
    CONSTRAINT c_documents_document_id UNIQUE (document_id)
  )
    `)

    this.handle.exec(`
  CREATE TABLE IF NOT EXISTS version (
    major INT PRIMARY KEY,
    minor INT
  ) WITHOUT ROWID;
    `)

    this.handle.exec('CREATE INDEX IF NOT EXISTS idx_followers_get ON followers(username_id,accepted,private,created)')

    this.handle.exec('INSERT INTO version (major, minor) VALUES (1, 0) ON CONFLICT(major) DO NOTHING')
  }

  dbHandle(): DatabaseSync {
    return this.handle
  }

  announce(message: AP.Announce): Database {
    throw new NotImplementedError()
  }

  follow(message: AP.Follow): Database {
    throw new NotImplementedError()
  }

  like(message: AP.Like): Database {
    throw new NotImplementedError()
  }

  note(message: AP.Note): Database {
    throw new NotImplementedError()
  }

  actor(message: AP.ActorReference): Database {
    throw new NotImplementedError()
  }

  documentEntry(message: AP.CoreObjectReference | AP.LinkReference): Database {
    throw new NotImplementedError()
  }

  getDocument(dr: string | Kit.OrArray<AP.EntityReference> | undefined): DBDocument {
    throw new NotImplementedError()
  }
}

export const db = new LocalDB()
