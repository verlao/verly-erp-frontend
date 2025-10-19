import { onMounted, onUnmounted } from 'vue'

export interface KeyboardActions {
  onNext?: () => void
  onPrevious?: () => void
  onOpen?: () => void
  onClose?: () => void
  onMarkRead?: () => void
  onConvert?: () => void
  onEmail?: () => void
  onWhatsapp?: () => void
  onArchive?: () => void
  onShowNew?: () => void
  onShowAll?: () => void
  onShowQualified?: () => void
}

export function useLeadKeyboard(actions: KeyboardActions) {
  const handleKeydown = (event: KeyboardEvent) => {
    // Ignore se estiver em um input/textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    // Navegação
    if (event.key === 'j' || event.key === 'ArrowDown') {
      event.preventDefault()
      actions.onNext?.()
    } else if (event.key === 'k' || event.key === 'ArrowUp') {
      event.preventDefault()
      actions.onPrevious?.()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      actions.onOpen?.()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      actions.onClose?.()
    }
    // Ações
    else if (event.key === 'r') {
      event.preventDefault()
      actions.onMarkRead?.()
    } else if (event.key === 'c') {
      event.preventDefault()
      actions.onConvert?.()
    } else if (event.key === 'e') {
      event.preventDefault()
      actions.onEmail?.()
    } else if (event.key === 'w') {
      event.preventDefault()
      actions.onWhatsapp?.()
    } else if (event.key === 'a') {
      event.preventDefault()
      actions.onArchive?.()
    }
    // Filtros
    else if (event.key === 'n') {
      event.preventDefault()
      actions.onShowNew?.()
    } else if (event.key === 't') {
      event.preventDefault()
      actions.onShowAll?.()
    } else if (event.key === 'q') {
      event.preventDefault()
      actions.onShowQualified?.()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    handleKeydown
  }
}
