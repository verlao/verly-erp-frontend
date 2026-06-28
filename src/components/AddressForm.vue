<template>
  <div class="space-y-3">
    <!-- CEP -->
    <div class="relative">
      <label class="block text-xs font-medium text-gray-600 mb-1">CEP</label>
      <input
        :value="local.cep || ''"
        @input="onCepInput"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="00000-000"
        maxlength="9"
      />
      <div
        v-if="searchingCep"
        class="absolute inset-y-0 right-0 flex items-center pr-3 top-6"
      >
        <svg
          class="animate-spin h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <p v-if="cepError" class="mt-1 text-sm text-red-600">{{ cepError }}</p>
    </div>

    <!-- Logradouro + Número -->
    <div class="grid grid-cols-3 gap-3">
      <div class="col-span-2 relative">
        <label class="block text-xs font-medium text-gray-600 mb-1">Logradouro</label>
        <input
          :value="local.logradouro || ''"
          @input="onLogradouroInput"
          type="text"
          :disabled="fieldsLocked"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
        <!-- Dropdown autocomplete -->
        <ul
          v-if="enableStreetSearch && streetSuggestions.length > 0"
          class="absolute z-10 mt-1 w-full bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <li
            v-for="(s, i) in streetSuggestions"
            :key="i"
            class="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-border last:border-b-0"
            @click="pickSuggestion(s)"
          >
            <span class="font-medium">{{ s.logradouro }}</span>
            <span class="text-xs text-muted-foreground"
              > • {{ s.bairro }} • CEP {{ s.cep }}</span
            >
          </li>
        </ul>
        <p
          v-if="enableStreetSearch && searchingStreet"
          class="mt-1 text-xs text-muted-foreground"
        >
          Buscando ruas…
        </p>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Número</label>
        <input
          :value="local.number || ''"
          @input="onFieldInput($event, 'number')"
          type="text"
          :disabled="fieldsLocked"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
    </div>

    <!-- Bairro + Cidade -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
        <input
          :value="local.bairro || ''"
          @input="onFieldInput($event, 'bairro')"
          type="text"
          :disabled="fieldsLocked"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
        <input
          :value="local.localidade || ''"
          @input="onFieldInput($event, 'localidade')"
          type="text"
          :disabled="fieldsLocked"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
    </div>

    <!-- Complemento -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
      <input
        :value="local.complemento || ''"
        @input="onFieldInput($event, 'complemento')"
        type="text"
        :disabled="fieldsLocked"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
      />
    </div>

    <!-- Referência -->
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Referência</label>
      <input
        :value="local.reference || ''"
        @input="onFieldInput($event, 'reference')"
        type="text"
        :disabled="fieldsLocked"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import cepService, { type CepResponse } from '../services/cep'
import type { AddressDTO } from '../services/customer'
import { maskCep } from '../lib/masks'

interface Props {
  modelValue: AddressDTO
  // Quando true, todos os campos exceto CEP ficam disabled até CEP válido encontrado.
  // Usado em Customers.vue pra evitar entrada manual antes de confirmar CEP.
  // No wizard de novo orçamento, deixa em false pra permitir entrada livre.
  lockUntilCepValid?: boolean
  // Quando true, habilita autocomplete de logradouro via BE forward search.
  enableStreetSearch?: boolean
  // UF padrão pro forward search (default RJ).
  defaultUf?: string
}

const props = withDefaults(defineProps<Props>(), {
  lockUntilCepValid: false,
  enableStreetSearch: false,
  defaultUf: 'RJ',
})

const emit = defineEmits<{
  'update:modelValue': [value: AddressDTO]
}>()

const local = computed(() => props.modelValue || ({} as AddressDTO))

const searchingCep = ref(false)
const cepError = ref('')
// Quando lockUntilCepValid=false, fields sempre destravados. Quando true,
// só destravam após CEP ser preenchido com sucesso.
const cepFound = ref(!!local.value.cep)
const fieldsLocked = computed(() => props.lockUntilCepValid && !cepFound.value)

let cepTimeout: ReturnType<typeof setTimeout> | null = null
let streetTimeout: ReturnType<typeof setTimeout> | null = null
let streetAbort: AbortController | null = null

function update(patch: Partial<AddressDTO>) {
  emit('update:modelValue', { ...local.value, ...patch })
}

function onFieldInput(e: Event, key: keyof AddressDTO) {
  const target = e.target as HTMLInputElement
  update({ [key]: target.value } as Partial<AddressDTO>)
}

function onCepInput(e: Event) {
  const target = e.target as HTMLInputElement
  const masked = maskCep(target.value)
  update({ cep: masked })
  cepError.value = ''

  const digits = masked.replace(/\D/g, '')
  if (digits.length === 8) {
    if (cepTimeout) clearTimeout(cepTimeout)
    cepTimeout = setTimeout(() => buscarCep(masked), 500)
  } else {
    if (props.lockUntilCepValid) cepFound.value = false
  }
}

async function buscarCep(cep: string) {
  if (searchingCep.value) return
  searchingCep.value = true
  cepError.value = ''
  try {
    const result = await cepService.buscarCep(cep)
    if (result) {
      update({
        cep: maskCep(cep),
        logradouro: result.logradouro || local.value.logradouro || '',
        bairro: result.bairro || local.value.bairro || '',
        localidade: result.localidade || local.value.localidade || '',
        complemento: result.complemento || local.value.complemento || '',
      })
      cepFound.value = true
    } else {
      cepError.value = 'CEP não encontrado'
      if (props.lockUntilCepValid) cepFound.value = false
    }
  } catch (err) {
    console.error(err)
    cepError.value = 'Erro ao buscar CEP'
    if (props.lockUntilCepValid) cepFound.value = false
  } finally {
    searchingCep.value = false
  }
}

// ===== forward search por rua =====
const streetSuggestions = ref<CepResponse[]>([])
const searchingStreet = ref(false)

function onLogradouroInput(e: Event) {
  const target = e.target as HTMLInputElement
  update({ logradouro: target.value })

  if (!props.enableStreetSearch) return
  if (streetTimeout) clearTimeout(streetTimeout)

  const rua = target.value.trim()
  const cidade = (local.value.localidade || '').trim()
  if (rua.length < 3 || cidade.length < 3) {
    streetSuggestions.value = []
    return
  }

  streetTimeout = setTimeout(() => buscarRuas(rua, cidade), 400)
}

async function buscarRuas(rua: string, cidade: string) {
  if (streetAbort) streetAbort.abort()
  streetAbort = new AbortController()
  searchingStreet.value = true
  try {
    const results = await cepService.buscarPorRua(props.defaultUf, cidade, rua)
    streetSuggestions.value = results.slice(0, 8)
  } catch (err) {
    console.error(err)
    streetSuggestions.value = []
  } finally {
    searchingStreet.value = false
  }
}

function pickSuggestion(s: CepResponse) {
  update({
    cep: maskCep(s.cep || ''),
    logradouro: s.logradouro || '',
    bairro: s.bairro || '',
    localidade: s.localidade || '',
    complemento: s.complemento || local.value.complemento || '',
  })
  streetSuggestions.value = []
  cepFound.value = true
}

// Se prop muda externamente (ex: form reset), atualiza estado interno
watch(
  () => props.modelValue?.cep,
  newCep => {
    if (!newCep) {
      cepFound.value = false
    } else {
      cepFound.value = true
    }
  },
  { immediate: true }
)
</script>
