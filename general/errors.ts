/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
type ErrorOptions = {
  cause? : Error
}

export class DataError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'DataError'
  }
}

export class NotImplementedError extends Error {
  constructor(message = 'Not Implemented', options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'NotImplementedError'
  }
}
