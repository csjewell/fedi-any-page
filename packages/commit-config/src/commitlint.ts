/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2026 Curtis Jewell and other contributors
 */
import { defineConfig, type UserConfig } from 'cz-git'

export type ScopeInformation = Array<{
  scope       : string
  name?       : string,
  directory?  : string,
  default?    : boolean,
  description : string,
}>

type DirectoryMapT = Map<string, DirectoryMapT | string>
type PromptInformationT = Array<{ name: string, value: string, }>

const lookupScope = (dirSplit: Array<string>, map: DirectoryMapT, defaultScope: string): string => {
  const dir   = dirSplit.length > 0 ? dirSplit[0] : ''
  const entry = map.get(dir)

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (typeof entry) {
    case 'undefined': {
      return defaultScope
    }
    case 'string': {
      return entry
    }
    default: {
      return lookupScope(dirSplit.toSpliced(0, 1), entry, defaultScope)
    }
  }
}

const getDefaultScopes = (files: Array<string>, map: DirectoryMapT, defaultScope: string) : Array<string> => {
  const uniq = new Map()

  return files.map(file => lookupScope(file.split('/'), map, defaultScope))
    .filter((scope) => {
      if (uniq.has(scope)) {
        return false
      }
      uniq.set(scope, 1)
      return true
    })
    .sort()
}

const setScopeMapFinalEntry = (dirMap: DirectoryMapT, originalDirectory: string, dir: string, scope: string ) => {
  const entry = dirMap.get(dir)

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (typeof entry) {
    case 'undefined': {
      dirMap.set(dir, scope)
      break
    }
    case 'string': {
      if (entry !== scope) {
        throw new Error(`Attempted to overwrite directory mapping for ${ originalDirectory } with ${ scope } (original value '${ entry }')`)
      }
      break
    }
    default: {
      entry.set('', scope)
    }
  }
}

const setScopeMap = (dirMap: DirectoryMapT, originalDirectory: string, dirSplit: Array<string>, scope: string) => {
  if (dirSplit.length === 1) {
    setScopeMapFinalEntry(dirMap, originalDirectory, dirSplit[0], scope)
    return
  }

  const entry = dirMap.get(dirSplit[0])

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (typeof entry) {
    case 'undefined': {
      const undefMap = new Map() as DirectoryMapT

      setScopeMap(undefMap, originalDirectory, dirSplit.toSpliced(0, 1), scope)
      dirMap.set(dirSplit[0], undefMap)
      break
    }
    case 'string': {
      // Expand the string to a map, because we need to drill farther down.
      const m = new Map() as DirectoryMapT

      m.set('', entry)
      setScopeMap(m, originalDirectory, dirSplit.toSpliced(0, 1), scope)
      dirMap.set(dirSplit[0], m)
      break
    }
    default: {
      setScopeMap(entry, originalDirectory, dirSplit.toSpliced(0, 1), scope)
    }
  }
}

const processScopeInformation = (info: ScopeInformation) : {
  scopeList    : Array<string>,
  defaultScope : string,
  directoryMap : DirectoryMapT,
  promptList   : PromptInformationT,
} => {
  const defaultScopes = info.filter(entry => entry.default === true).map(entry => entry.scope)

  if (defaultScopes.length !== 1) {
    throw new Error('Scope information must provide one (and only one) default')
  }
  const defaultScope = defaultScopes[0]

  // eslint-disable-next-line unicorn/no-array-reduce
  const maxNameLength: number = info.map(e => e.name ?? e.directory ?? defaultScope).map(e => e.length).reduce((prev, e) => prev < e ? e : prev, 0)

  const promptList = info.map((e) => {
    let dirName = e.name ?? e.directory ?? defaultScope

    dirName += ': '
    dirName.padEnd(maxNameLength + 2 - dirName.length)
    return { value: e.scope, name: dirName + e.description, }
  })

  const directoryMap = new Map() as DirectoryMapT

  info.forEach((entry) => {
    if (entry.directory !== undefined) {
      setScopeMap(directoryMap, entry.directory, entry.directory.split('/'), entry.scope)
    }
  })
  return {
    scopeList : info.map(entry => entry.scope),
    defaultScope,
    directoryMap,
    promptList,
  }
}

export const getConfig = (info: ScopeInformation, files: Array<string>) : UserConfig => {
  const ret = processScopeInformation(info)

  return defineConfig({
    parserPreset : 'conventional-changelog-conventionalcommits',
    rules        : {
      'body-case'                        : [ 2, 'always', 'sentence-case' ],
      'body-leading-blank'               : [ 2, 'always' ],
      'body-max-line-length'             : [ 2, 'always', 80 ],
      'breaking-change-exclamation-mark' : [ 2, 'always' ],
      'footer-leading-blank'             : [ 1, 'always' ],
      'footer-max-line-length'           : [ 2, 'always', 80 ],
      'header-max-length'                : [ 2, 'always', 55 ],
      'header-trim'                      : [ 2, 'always' ],
      'scope-enum'                       : [ 2, 'always', ret.scopeList ],
      'scope-case'                       : [ 2, 'always', 'lower-case' ],
      'subject-case'                     : [ 2, 'always', 'sentence-case' ],
      'subject-empty'                    : [ 2, 'never' ],
      'subject-full-stop'                : [ 2, 'never',  '.' ],
      'subject-min-length'               : [ 2, 'always', 5 ],
      'type-case'                        : [ 2, 'always', 'lower-case' ],
      'type-empty'                       : [ 2, 'never' ],
      'type-enum'                        : [
        2,
        'always',
        [ 'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'test' ],
      ],
    },
    prompt : {
      themeColorCode         : '38;75;208',
      markBreakingChangeMode : true,
      enableMultipleScopes   : true,
      confirmColorize        : false,
      allowCustomIssuePrefix : false,
      defaultScope           : getDefaultScopes(files, ret.directoryMap, ret.defaultScope),
      issuePrefixes          : [{ value: 'Closed:', name: 'Closed: Issues have been processed', }],
      scopes                 : ret.promptList,
      scopeEnumSeparator     : ',',
      formatMessageCB        : ({ type, scope, markBreaking, subject, body, breaking, footer, }) => {
        let myFooter

        if (footer.length > 0) {
          myFooter = `${ footer }\nCommit-Type: ${ type }`
        } else {
          myFooter = `\n\nCommit-Type: ${ type }`
        }
        let scopeHeader = ''

        if (scope.includes(',')) {
          scopeHeader = `multiple${ markBreaking }: `
          myFooter += `\nScopes: ${ scope }`
        } else if (scope.length > 0) {
          scopeHeader = `${ scope }${ markBreaking }: `
        }
        let msg = `${ scopeHeader }${ subject }`

        if (body.length > 0) {
          msg += `\n\n${ body }`
        }
        if (breaking.length > 0) {
          msg += `\n\nBREAKING CHANGE: ${ breaking }`
        }

        msg += myFooter
        console.warn(msg)
        return msg
      },
    },
  })
}
