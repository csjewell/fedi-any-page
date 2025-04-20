/* SPDX-License-Identifier: MIT
 * SPDX-FileCopyrightText: 2025 Curtis Jewell and other contributors
 */
import { createElement, type FunctionComponent, type VNode } from 'preact'
import type { HelperRenderOptions } from '@ant-design/icons-svg/es/helpers'
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types'

const defaultColors = {
  primaryColor   : '#333',
  secondaryColor : '#E6E6E6',
}

const renderAbstractNodeToVNode = (
  node: AbstractNode,
  options: HelperRenderOptions,
): VNode => {
  const targetAttrs
    = node.tag === 'svg'
      ? {
        ...node.attrs,
        ...options.extraSVGAttrs,
      }
      : node.attrs

  const children = (node.children ?? [])
    .map(child => renderAbstractNodeToVNode(child, options))

  if (children.length > 0) {
    return createElement(node.tag, targetAttrs, children)
  }

  return createElement(node.tag, targetAttrs)
}

const renderIconDefinitionToVNode = (
  icond: IconDefinition,
  options: HelperRenderOptions = {},
): VNode => {
  if (typeof icond.icon === 'function') {
    // two-tone
    const placeholders = options.placeholders ?? defaultColors

    return renderAbstractNodeToVNode(
      icond.icon(placeholders.primaryColor, placeholders.secondaryColor),
      options,
    )
  }

  // fill, outline
  return renderAbstractNodeToVNode(icond.icon, options)
}

/**
 * Display an icon from \@ant-design/icons-svg.
 *
 * @param width - The width the icon should be displayed at.
 * @param height - The height the icon should be displayed at.
 * @param fill - The icon's main color.
 * @param icon - The icon to display.
 * @returns A FunctionComponent, to be consumed by JSX or HTM.
 */
const Icon: FunctionComponent<{
  width? : string, height? : string, fill? : string, icon : IconDefinition
}> = ({
  width = '1em', height = '1em', fill = 'currentColor', icon,
}) => {
  return renderIconDefinitionToVNode(icon, {
    extraSVGAttrs : { width, height, fill, },
  })
}

/* eslint-disable-next-line import-x/no-default-export */
export default Icon
