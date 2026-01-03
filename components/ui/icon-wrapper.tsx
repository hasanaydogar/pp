'use client'

import React from 'react'

export function IconWrapper({ children }: { children: React.ReactNode }) {
  return React.cloneElement(
    children as React.ReactElement<{ 'data-slot'?: string }>,
    { 'data-slot': 'icon' }
  )
}

