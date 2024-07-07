<script lang="ts" setup>
import { trpc } from '@/trpc'
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tryCatch } from '@/composables'
import { getCountryDataList } from 'countries-list'

const artist = ref()
const route = useRoute()
const artistId = Number(route.params.id)
const countryList = ref<string[]>([])
const router = useRouter()

const info = ref('')

const formatted = computed(() => {
  if (artist.value) {
    const date = new Date(artist.value.birth)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return null
})

function submitChanges() {
  if (artist.value) {
    tryCatch(async () => {
      artist.value.birth = formatted.value
      await trpc.artist.update.mutate({ id: artistId, ...artist.value, birth: formatted.value })

      router.push({ name: 'Artist', params: { id: artistId } })
    })
  }
}

function submitRequest() {
  if (artist.value) {
    tryCatch(async () => {
      await trpc.request.update.add.mutate({
        entity: 'ARTIST',
        entityId: artistId,
        info: info.value,
        ...artist.value,
        birth: formatted.value,
      })

      router.push({ name: 'Artist', params: { id: artistId } })
    })
  }
}

onBeforeMount(async () => {
  tryCatch(async () => {
    countryList.value = getCountryDataList().map((c) => c.name)
    const data = await trpc.artist.get.query(artistId)
    artist.value = data
    artist.value.birth = data.birth !== null ? new Date(data.birth) : null
  })
})
</script>

<template>
  <div v-if="artist">
    <v-text-field v-model="artist.name"></v-text-field>
    <div>
      <v-date-input
        label="Birth date (optional)"
        v-model="artist.birth"
        clearable
        @click:clear="artist.birth = null"
      ></v-date-input>
    </div>
    <div class="mt-6">
      <v-select
        clearable
        v-model="artist.origin"
        :items="countryList"
        variant="solo-filled"
        label="Place of birth (optional)"
      ></v-select>
    </div>
    <v-textarea
      v-model="info"
      label="Provide source(s) and/or clarification for the changes."
      variant="solo-filled"
    ></v-textarea>

    <v-btn @click.prevent="submitChanges()">Update</v-btn>
    <v-btn @click.prevent="submitRequest()">Submit</v-btn>
  </div>
</template>
