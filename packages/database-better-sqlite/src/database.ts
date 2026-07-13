/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { type Database, default as newDatabase } from 'better-sqlite3'
import { Database as APDatabase, NotImplementedError, type Server } from '@csjewell-activitypub/general'
import { ActorSQLiteStorage } from './actor.ts'
import { AnnounceSQLiteStorage } from './announce.ts'
import { DocumentSQLiteStorage } from './document.ts'
import { FollowSQLiteStorage } from './follow.ts'
import { KeysSQLiteStorage } from './keys.ts'
import { LikeSQLiteStorage } from './like.ts'
import { NoteSQLiteStorage } from './note.ts'
import { RepliesSQLiteStorage } from './replies.ts'
import type { Keyv } from 'keyv'
import type * as AP from '@csjewell-activitypub/types'

type RepliesStorage = APDatabase.StorageHandler<Server.RePliers.ReplyList>
  & APDatabase.RepliesHandler

export class SQLiteDatabase
  extends APDatabase.SessionRouter
  implements APDatabase.Router<Database> {
  public handle : Database

  constructor(cache: Keyv, dbInfo: string | Database) {
    super(cache)
    if ('string' === typeof dbInfo) {
      this.handle = newDatabase(dbInfo)
    } else {
      this.handle = dbInfo
    }
    this.init()
  }

  init = (): void => {
    // Local users table
    //
    // active: The user is active
    // username: Username for the user
    // password: Crypted password for the user.
    // homepage: Homepage link to put in Actor document.
    // summary: Description to put in repository.
    // name: Name used in profile display and document summaries.
    // at_protocol_id: The AT (BlueSky) protocol ID.
    // key_id: Link to keys table
    // is_admin: Can I add users or not?
    // outbox_last_ran: When was the outbox last ran?
    // outbox_needs_ran: Run the outbox processing for this user if true.
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        active INT NOT NULL CHECK (active > -1) CHECK (active < 2) DEFAULT 1,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        actor_identifier TEXT NOT NULL,
        homepage TEXT,
        summary TEXT,
        name TEXT,
        at_protocol_id TEXT,
        key_id INTEGER REFERENCES keys(id),
        is_admin INT NOT NULL CHECK (is_admin > -1) CHECK (is_admin < 2) DEFAULT 0,
        outbox_last_ran INT NOT NULL,
        outbox_needs_ran INT NOT NULL CHECK (outbox_needs_ran > -1) CHECK (outbox_needs_ran < 2) DEFAULT 0
      ) STRICT
    `)

    // Keys used on users/actors
    //
    // actor_id: Link to actors table.
    // public_key: Public key of actor.
    // private_key: Private key of actor, if local.
    // expired: Is this not the current public key pair?
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id INTEGER NOT NULL REFERENCES actors(id),
        public_key TEXT NOT NULL,
        private_key TEXT,
        expired INT NOT NULL CHECK (expired > -1) CHECK (expired < 2) DEFAULT 0
      ) STRICT
    `)

    // Notes/Articles saved on our documents or on descendants of them
    //
    // message_identifier: The identifier of outgoing/incoming note/article
    // user_id: Set if a user on our instance replied
    // actor_id: Set if an actor on a federated instance replied
    // document_id: Set to the outgoing document id
    // reply_document_id: Set to the document id of the document being replied to.
    // created: Date the reply entry was created
    // modified: Date the table was modified in any way
    // private: The reply is set private by the user creating it.
    // hidden: The reply is hidden by our user
    // why_hidden: Why was it hidden?
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS replies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_identifier TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        actor_id INTEGER REFERENCES actors(id),
        document_id INT REFERENCES documents(id),
        reply_document_id INT REFERENCES documents(id),
        creation_document_id INT REFERENCES documents(id),
        created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
        hidden INT NOT NULL CHECK (expired > -1) CHECK (expired < 2) DEFAULT 0,
        why_hidden TEXT DEFAULT '',
        CONSTRAINT c_replies_message_identifier UNIQUE (message_identifier)
      ) STRICT
    `)

    // store all actors
    //
    // identifier: AP.Actor->id
    // user_id: Set if the actor is a local user
    // document_id: Set to the 'document' where the actor information is stored.
    // username: '@' AP.Actor->preferredUsername '@' AP.Actor->id.host
    // name: AP.Actor->name
    // inbox: AP.Actor->inbox
    // outbox: AP.Actor->outbox
    // followers: AP.Actor->followers
    // created: Date the actor entry was created.
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS actors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        username TEXT NOT NULL
        name TEXT
        document_id INTEGER NOT NULL REFERENCES documents(id),
        created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        inbox TEXT,
        outbox TEXT,
        followers TEXT,
        CONSTRAINT c_actors_identifier UNIQUE (identifier)
      ) STRICT
    `)

    // Outbox representation
    //
    // identifier: AP.CoreObject->id (denormalized from document)
    // user_id: User sending out document
    // document_id: Document to send out
    // created: When outbox entry created in the database.
    // sent: When this was posted to the user.
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        document_id INTEGER NOT NULL REFERENCES documents(id),
        created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_response_status INT,
        sent INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT c_outbox_identifier UNIQUE (identifier)
      ) STRICT
    `)

    // store documents
    //
    // identifier: AP.CoreObject->id
    // type: AP.CoreObject->type (Type of document)
    // url: Document retrievable from the web
    // document: Document stored as blob in the DB
    // r2_key: Key to use to retrieve from cache
    // r2_index: Index to use to retrieve from cache
    // created: When created, if we know it.
    // inserted: When inserted into the database
    // updated: When the database was last updated
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        identifier TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT,
        document BLOB,
        r2_key TEXT,
        r2_index INTEGER,
        created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        inserted TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT c_documents_identifier UNIQUE (identifier)
      )
    `)

    // actor (external or internal) likes document (including reply)
    //
    // identifier: The identifier of the document they liked
    //   (from the document linked with document_liked_id)
    //   = AP.Create->object.id (denormalized from document)
    // actor_id: The actor that liked the document
    // document_id: The document that created the like. (AP.Create)
    // document_liked_id: Which document did they like? (AP.Create->object)
    // created: Date the like entry was created in the DB.
    // modified: Date the row was modified in any way
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT NOT NULL,
        actor_id INTEGER NOT NULL REFERENCES actors(id),
        document_id INTEGER NOT NULL REFERENCES documents(id),
        document_liked_id INTEGER NOT NULL REFERENCES documents(id),
        created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `)

    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS version (
        major INT PRIMARY KEY,
        minor INT
      ) WITHOUT ROWID;
    `)

    // TABLES BELOW ARE NOT BEING USED IN ANGER YET

    // actor follows local user
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
  ) STRICT
    `)

    // local user follows actor
    this.handle.exec(`
      CREATE TABLE IF NOT EXISTS following (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        actor_id INTEGER NOT NULL REFERENCES actors(id),
        private INT NOT NULL CHECK (private > -1) CHECK (private < 2) DEFAULT 0,
        deletable INT NOT NULL CHECK (deletable > -1) CHECK (deletable < 2) DEFAULT 0,
        created INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        document_id TEXT NOT NULL REFERENCES documents(document_id),
        CONSTRAINT c_followers_message_id UNIQUE (message_id)
      ) STRICT
    `)

    this.handle.exec(`
      CREATE INDEX IF NOT EXISTS idx_followers_get
                ON followers(username_id,accepted,private,created)
    `)

    this.handle.exec(`
      INSERT
        INTO version (major, minor)
      VALUES         (1,     0)
          ON CONFLICT(major) DO NOTHING
    `)
  }

  dbHandle = (): Database => {
    return this.handle
  }

  announce = (message: AP.Announce): APDatabase.StorageHandler<AP.Announce> => {
    return new AnnounceSQLiteStorage(this, message)
  }

  follow = (message: AP.Follow): APDatabase.StorageHandler<AP.Follow> => {
    return new FollowSQLiteStorage(this, message)
  }

  like = (message: AP.Like): APDatabase.StorageHandler<AP.Like> => {
    return new LikeSQLiteStorage(this, message)
  }

  note = (message: AP.Note): APDatabase.StorageHandler<AP.Note> => {
    return new NoteSQLiteStorage(this, message)
  }

  actor = (message: AP.ActorReference): APDatabase.StorageHandler<AP.Actor> => {
    return new ActorSQLiteStorage(this, message)
  }

  replies = (message: AP.ExtendedObjectReference): RepliesStorage => {
    return new RepliesSQLiteStorage(this, message)
  }

  keys = (keyRef: string | AP.ActorReference): APDatabase.DatabaseKey => {
    return new KeysSQLiteStorage(this, keyRef)
  }

  documentEntry = (message: AP.CoreObjectReference | AP.LinkReference): APDatabase.StorageHandler<AP.CoreObject> => {
    return new DocumentSQLiteStorage(this, message)
  }

  getDocument = (_dr: string | AP.OrArray<AP.EntityReference> | undefined): APDatabase.DBDocument => {
    throw new NotImplementedError()
  }

  users = (): APDatabase.UsersStorage => {
    throw new NotImplementedError()
  }

  sendToOutbox = (_username: string, _public: boolean, _message: AP.CoreObject): AP.OrPromise<boolean> => {
    throw new NotImplementedError()
  }
}
