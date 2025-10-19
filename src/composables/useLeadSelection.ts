import { ref, computed } from 'vue'
import type { LeadDTO } from '../services/lead'

export function useLeadSelection(leads: any) {
  const selectedId = ref<number>()
  const checkedIds = ref<number[]>([])

  const selectedLead = computed(() => {
    if (!selectedId.value) return undefined
    return leads.value.find((lead: LeadDTO) => lead.id === selectedId.value)
  })

  const allChecked = computed(() => {
    return leads.value.length > 0 && leads.value.every((lead: LeadDTO) =>
      checkedIds.value.includes(lead.id)
    )
  })

  const selectLead = (lead: LeadDTO) => {
    selectedId.value = lead.id
  }

  const toggleCheck = (leadId: number) => {
    const index = checkedIds.value.indexOf(leadId)
    if (index === -1) {
      checkedIds.value.push(leadId)
    } else {
      checkedIds.value.splice(index, 1)
    }
  }

  const toggleAll = () => {
    if (allChecked.value) {
      checkedIds.value = []
    } else {
      checkedIds.value = leads.value.map((lead: LeadDTO) => lead.id)
    }
  }

  const clearSelection = () => {
    checkedIds.value = []
  }

  const selectNext = () => {
    if (!leads.value.length) return

    const currentIndex = leads.value.findIndex(
      (lead: LeadDTO) => lead.id === selectedId.value
    )

    if (currentIndex === -1) {
      selectedId.value = leads.value[0].id
    } else if (currentIndex < leads.value.length - 1) {
      selectedId.value = leads.value[currentIndex + 1].id
    }
  }

  const selectPrevious = () => {
    if (!leads.value.length) return

    const currentIndex = leads.value.findIndex(
      (lead: LeadDTO) => lead.id === selectedId.value
    )

    if (currentIndex === -1) {
      selectedId.value = leads.value[0].id
    } else if (currentIndex > 0) {
      selectedId.value = leads.value[currentIndex - 1].id
    }
  }

  return {
    selectedId,
    selectedLead,
    checkedIds,
    allChecked,
    selectLead,
    toggleCheck,
    toggleAll,
    clearSelection,
    selectNext,
    selectPrevious
  }
}
