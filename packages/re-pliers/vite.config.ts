/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { visualizer } from 'rollup-plugin-visualizer'
import upInfo from 'unplugin-info/vite'
import { viteStaticCopy as staticCopy } from 'vite-plugin-static-copy'
import { vitePluginVersionMark as versionMark } from 'vite-plugin-version-mark'
import { defineConfig } from 'vitest/config'
import { type PluginOption } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins : [
    preact() as PluginOption,
    upInfo(),
    staticCopy({
      targets : [{ src: 'src/re-pliers.css', dest: '', }],
    }),
    versionMark({ ifGlobal: false, }),
    visualizer({ gzipSize: true, brotliSize: true, emitFile: true, filename: "stats.html", }),
  ],

  test : {
    environment : 'jsdom',
  },

  build : {
    // lib: { entry: ['src/main.ts'], formats: ['es'], filename: 'dist/re-pliers.module.js', },
    modulePreload        : { polyfill: false, },
    outDir               : 'dist',
    minify               : 'oxc',
    emptyOutDir          : true,
    sourcemap            : true,
    license              : true,
    reportCompressedSize : true,

    rolldownOptions      : {
      input : {
        're-pliers' : 'src/index.ts',
      },
      output : {
        entryFileNames        : '[name].js',
        format                : 'esm',
        minifyInternalExports : true,
        sourcemapBaseUrl      : 'https://curtisjewell.dev/',
        generatedCode         : {
          preset          : 'es2015',
          symbols         : true,
        },
      },
      treeshake : {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
})

