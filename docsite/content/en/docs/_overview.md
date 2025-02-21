---
weight: 1
date: '2025-02-20T16:48:31-07:00'
title: 'Overview'
url: "docs/overview"
aliases:
- "/docs"
---

## The Goal ##

The goal of FediAnyPage is to go from "bottom-to-top" to generate a generic
TypeScript worker library that runs the non-static portion of a Fediverse
server, and a Hugo theme that uses that library to create a Fediverse-providing
blog. 

### Why ###

So that a Fediverse-providing and consuming blog can be hosted on a cheap
(quite possibly free) basis.

### Requirements ###

* Usable alongside most static site generators.
  * I happen to use Hugo, myself.
* Executable on any number of possible "web-worker providers"
  * [x] Cloudflare Pages/Workers
  * [ ] Vercel
  * [ ] Fly.io
  * [ ] Railway
  * AWS? GCP? OCI?
* Uses different databases, either document databases, or SQL-using ones.
  * [ ] Cloudflare D1 (SQL-using)
  * [ ] Firebase (a document database)
  * [ ] Turso

Being open-source, pull requests to add support for additional database and web-worker providers will be welcomed.
