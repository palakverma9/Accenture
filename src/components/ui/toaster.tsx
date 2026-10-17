'use client'

import * as React from 'react'
import type { ToastProps, ToastActionElement } from '@/components/ui/toast'
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast'

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

export function toast(props: ToastProps & { action?: ToastActionElement }) {
  // This is a placeholder for the toast function
  // In a real app, you'd use a library like sonner or a custom implementation
  console.log('Toast:', props)
}