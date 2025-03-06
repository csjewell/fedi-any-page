/* SPDX-License-Identifier: MIT */
interface ErrorOptions {
  cause?: Error
}

export class DataError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'DataError'
  }
}

export class NotImplementedError extends Error {
  constructor(message: string = 'Not Implemented', options: ErrorOptions = {}) {
    super(message, options)
    this.name = 'NotImplementedError'
  }
}
