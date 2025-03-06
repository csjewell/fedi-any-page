/* SPDX-License-Identifier: MIT */

/*
 */
export interface Database {
  databaseId(): number | undefined
  document(): unknown
  remove(): Promise<boolean>
  save(...arguments_: Array<unknown>): Promise<boolean>
  exists(): Promise<boolean>
  retrieve(): Promise<unknown>
  shorten(): Promise<{ url: URL | undefined; id: number | undefined }>
}
