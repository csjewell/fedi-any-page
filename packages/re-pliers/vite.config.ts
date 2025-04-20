/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import tsTreeshaking from 'rollup-plugin-ts-treeshaking'
import { visualizer } from 'rollup-plugin-visualizer'
import upInfo from 'unplugin-info/vite'
import upIsolatedDecl from 'unplugin-isolated-decl/vite'
import { viteStaticCopy as staticCopy } from 'vite-plugin-static-copy'
import { vitePluginVersionMark as versionMark } from 'vite-plugin-version-mark'
import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins : [
    preact(),
    upInfo(),
    upIsolatedDecl({
      exclude : 'src/types/*.ts',
    }),
    staticCopy({
      targets : [{ src: 'src/re-pliers.css', dest: '', }],
    }),
    versionMark({ ifGlobal: false, }),
    tsTreeshaking(),
    visualizer(),
  ],
  test : {
    environment : 'jsdom',
  },
  build : {
    // lib: { entry: ['src/main.ts'], formats: ['es'], filename: 'dist/re-pliers.module.js', },
    modulePreload : { polyfill: false, },
    emptyOutDir   : true,
    sourcemap     : true,

    // https://rollupjs.org/configuration-options/
    rollupOptions : {
      input : {
        're-pliers' : 'src/index.ts',
      },
      output : {
        entryFileNames        : '[name].js',
        dir                   : 'dist',
        format                : 'esm',
        compact               : true,
        minifyInternalExports : true,
        sourcemapBaseUrl      : 'https://curtisjewell.dev/',
        validate              : true,
        generatedCode         : {
          arrowFunctions  : true,
          constBindings   : true,
          objectShorthand : true,
          preset          : 'es2015',
          symbols         : true,
          // hashCharacters: 'base36',
        },
      },
      treeshake : 'smallest',
    },
  },
})

