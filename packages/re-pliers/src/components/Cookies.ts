/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2024 Nihility.io (Marvin Peter)
 */

/* eslint-disable */ // Not my code.

import JSCookies from 'js-cookie'

// Usage: import { Cookies } from './Cookies.ts'

/*
 * This is the license that applies to this file:

MIT License

Copyright (c) 2024 Nihility.io (Marvin Peter)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/**
 * JavaScript primitive type
 */
export type PrimitiveType = string | number | boolean

/**
 * Function that called whenever a change to the specified cookie occurs
 */
type CookieSubscriber = (value?: PrimitiveType, oldValue?: PrimitiveType) => void

/**
 * Functions that removes a subscriber
 */
type CookieUnsubscriber = () => void

/**
 * Defines additional cookie parameters
 */
export type CookieOptions = {
  /**
	 * Define when the cookie will be removed. Value can be a Number
	 * which will be interpreted as days from time of creation or a
	 * Date instance. If omitted, the cookie becomes a session cookie.
	 */
  expires? : number | Date

  /**
	 * Define the path where the cookie is available. Defaults to '/'
	 */
  path? : string

  /**
	 * Define the domain where the cookie is available. Defaults to
	 * the domain of the page where the cookie was created.
	 */
  domain? : string

  /**
	 * A Boolean indicating if the cookie transmission requires a
	 * secure protocol (https). Defaults to false.
	 */
  secure? : boolean

  /**
	 * Asserts that a cookie must not be sent with cross-origin requests,
	 * providing some protection against cross-site request forgery
	 * attacks (CSRF)
	 */
  sameSite? : 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None'

  /**
	 * An attribute which will be serialized, conformably to RFC 6265
	 * section 5.2.
	 */
  [property: string] : unknown
}

/**
 * Interact with cookies and subscribe to changes. Cookies intercepts calls to document.cookie
 * in order to notify subscribers when a cookie has changed.
 * It uses js-cookie under the hood
 */
export class Cookies {
  /**
	 * Log interceptions if set to true
	 */
  public static debug = false

  /**
	 * Stores all subscribers for specific cookie names
	 */
  static #subscribers : Record<string, Array<CookieSubscriber>> = {}

  /**
	 * Keeps track if the interceptor has already been installed
	 */
  static #isIntercepting = false

  /**
	 * Convert a boolean, number or string into a string
	 * @param value Value
	 * @returns String value
	 */
  static #toCookieValue<T extends PrimitiveType>(value: T): string {
    switch (typeof value) {
      case 'string': {
        return value
      }
      case 'number': {
        return String(value)
      }
      case 'boolean': {
        return value ? 'true' : 'false'
      }
      default: {
        return JSON.stringify(value)
      }
    }
  }

  /**
	 * Converts a cookie string value into boolean, number or string
	 * @param value String value
	 * @returns Converted value
	 */
  static #fromCookieValue(value?: string): PrimitiveType | undefined {
    if (value === undefined) {
      return undefined
    }
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
    if ((/^-?\d+(\.\d+)?$/).test(value)) {
      return Number(value)
    }

    return value
  }

  /**
	 * Intercepts calls to document.cookie in order to notify subscribers
	 */
  static #startIntercepting(): void {
    // Return if the interceptor is ready installed
    if (this.#isIntercepting) {
      return
    }

    // Only use interception if cookies are enabled
    if (!navigator.cookieEnabled) {
      return
    }

    // Save the original cookie functionality
    const original = Object.getOwnPropertyDescriptor(globalThis.Document.prototype, 'cookie')!
    const getCookie = original.get.bind(globalThis.document)!
    const setCookie = original.set.bind(globalThis.document)!

    // If the descriptor is not configurable, interception won't work
    if (!original.configurable) {
      console.info('[Cookie Interception] Cannot react to cookie changes, because interception has been blocked.')
      return
    }

    if (Cookies.debug) {
      console.debug(
        '[Cookie Interception] Start intercepting cookies',
      )
    }

    // Install the interceptor
    Object.defineProperty(globalThis.document, 'cookie', {
      configurable : true,
      // Do not intercept cookie reading
      get          : getCookie,

      // Intercept cookie writing
      set(value: string): void {
        // Ignore invalid values
        if (!value.includes('=')) {
          setCookie(value); return
        }

        // Extract the cookie name
        const name = value.slice(0, Math.max(0, value.indexOf('=')))

        // Get the old cookie value
        const oldValue = Cookies.get(name)

        // Write the cookie using the original function
        setCookie(value)

        // Get the new cookie value
        const newValue = Cookies.get(name)

        // Log interception
        if (Cookies.debug) {
          console.info(
            `[Cookie Interception] Name: ${ name }; Old Value: ${ JSON.stringify(oldValue) }; New Value: ${
              JSON.stringify(newValue)
            }`,
          )
        }

        // Notify subscribers
        Cookies.#subscribers[name].forEach((f) => { f(newValue, oldValue) })
      },
    })

    Cookies.#isIntercepting = true
  }

  /**
	 * Subscribes to changes to a cookie with a given name
	 * @param name Cookie name
	 * @param f Subscriber function
	 * @returns Unsubscribe function
	 */
  public static subscribe(name: string, f: CookieSubscriber): CookieUnsubscriber {
    // Start interception cookie writes once the first subscriber is added
    Cookies.#startIntercepting()

    // Store the subscriber function
    if (!(name in Cookies.#subscribers)) {
      Cookies.#subscribers[name] = []
    }

    Cookies.#subscribers[name].push(f)
    // Returns an unsubscribe function
    return () => {
      Cookies.#subscribers[name].splice(Cookies.#subscribers[name].indexOf(f))
    }
  }

  /**
   * Reads and parse a cookie with a given name.
   * @param name Cookie name
   * @param defaultValue Default value if the cookie does not exist
   * @returns Parsed cookie value or default value if the cookie does not exist
   */
  public static get(name: string): PrimitiveType | undefined
  public static get(name: string, defaultValue: string): string
  public static get(name: string, defaultValue: number): number
  public static get(name: string, defaultValue: boolean): boolean
  public static get<T extends PrimitiveType>(name: string, defaultValue: T): T
  public static get<T>(name: string, defaultValue?: T): T | PrimitiveType | undefined {
    const res = JSCookies.get(name)

    // Return the default value if cookie was not found
    if (res === undefined) {
      return defaultValue
    }

    return Cookies.#fromCookieValue(res)
  }

  /**
   * Writes a cookie with a give name.
   * @param name Cookie name
   * @param value Cookie value
   * @param options Cookie options
   */
  public static set<T extends Optional<PrimitiveType>>(name: string, value: T, options: CookieOptions = {}): void {
    if (value === undefined) {
      Cookies.remove(name, options)
      return
    }

    JSCookies.set(name, Cookies.#toCookieValue(value), options)
  }

  /**
   * Removes a cookie with a give name.
   * @param name Cookie name
   * @param options Cookie options
   */
  public static remove(name: string, options: CookieOptions = {}): void {
    JSCookies.remove(name, options)
  }
}

