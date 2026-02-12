import { ref, provide, inject, defineComponent, h, cloneVNode } from 'vue'

// AlertDialog Context
interface AlertDialogContext {
  isOpen: any
  open: () => void
  close: () => void
}

// AlertDialog Root
export const AlertDialog = defineComponent({
  name: 'AlertDialog',
  setup(_, { slots }) {
    const isOpen = ref(false)
    
    const context: AlertDialogContext = {
      isOpen,
      open: () => isOpen.value = true,
      close: () => isOpen.value = false
    }
    
    provide('alertDialog', context)

    return () => slots.default?.()
  }
})

// AlertDialog Trigger
export const AlertDialogTrigger = defineComponent({
  name: 'AlertDialogTrigger',
  props: {
    asChild: Boolean
  },
  setup(props, { slots }) {
    const dialog = inject('alertDialog') as AlertDialogContext
    
    return () => {
      const child = slots.default?.()?.[0]
      if (props.asChild && child) {
        return cloneVNode(child, {
          onClick: dialog.open
        })
      }
      return h('button', { onClick: dialog.open }, slots.default?.())
    }
  }
})

// AlertDialog Content
export const AlertDialogContent = defineComponent({
  name: 'AlertDialogContent',
  setup(_, { slots }) {
    const dialog = inject('alertDialog') as AlertDialogContext
    
    return () => {
      if (!dialog.isOpen.value) return null
      
      return h('div', {
        class: 'fixed inset-0 z-50 flex items-center justify-center',
        onClick: (e: Event) => {
          if (e.target === e.currentTarget) dialog.close()
        }
      }, [
        h('div', { class: 'fixed inset-0 bg-black/50 backdrop-blur-sm' }),
        h('div', {
          class: 'relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 rounded-lg'
        }, slots.default?.())
      ])
    }
  }
})

// AlertDialog Header
export const AlertDialogHeader = defineComponent({
  name: 'AlertDialogHeader',
  setup(_, { slots }) {
    return () => h('div', { class: 'flex flex-col space-y-2 text-center sm:text-left' }, slots.default?.())
  }
})

// AlertDialog Footer
export const AlertDialogFooter = defineComponent({
  name: 'AlertDialogFooter',
  setup(_, { slots }) {
    return () => h('div', { class: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2' }, slots.default?.())
  }
})

// AlertDialog Title
export const AlertDialogTitle = defineComponent({
  name: 'AlertDialogTitle',
  setup(_, { slots }) {
    return () => h('h2', { class: 'text-lg font-semibold' }, slots.default?.())
  }
})

// AlertDialog Description
export const AlertDialogDescription = defineComponent({
  name: 'AlertDialogDescription',
  setup(_, { slots }) {
    return () => h('p', { class: 'text-sm text-gray-600' }, slots.default?.())
  }
})

// AlertDialog Action
export const AlertDialogAction = defineComponent({
  name: 'AlertDialogAction',
  setup(_, { slots }) {
    const dialog = inject('alertDialog') as AlertDialogContext
    
    return () => h('button', {
      class: 'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white ring-offset-background transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      onClick: dialog.close
    }, slots.default?.())
  }
})

// AlertDialog Cancel
export const AlertDialogCancel = defineComponent({
  name: 'AlertDialogCancel',
  setup(_, { slots }) {
    const dialog = inject('alertDialog') as AlertDialogContext
    
    return () => h('button', {
      class: 'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 ring-offset-background transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
      onClick: dialog.close
    }, slots.default?.())
  }
})
