/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */

/**
 * Additional options that can be given when creating an Error class to throw
 *
 * @property cause - An {@link Error} that is the cause of an Error
 */
type ErrorOptions = {
  cause? : Error
}

/** The error that is to be thrown if something is incorrect... TODO */
export class DataError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'DataError'
  }
}

/** The error that is to be thrown if a method or function has not been implemented. */
export class NotImplementedError extends Error {
  constructor(message = 'Not Implemented', options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'NotImplementedError'
  }
}
