<script setup lang="ts">
import { trpc } from '@/trpc'
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tryCatch } from '@/composables'
import type { ArtistInsert } from '@mono/server/src/shared/entities'
import { getCountryDataList } from 'countries-list'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const countryList = ref<string[]>([])
const info = ref('')
const artistForm = ref<ArtistInsert>({
  name: '',
  birth: null,
  origin: '',
})

const formatted = computed(() => {
  if (artistForm.value.birth) {
    const date = new Date(artistForm.value.birth)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return null
})

const createArtist = () => {
  tryCatch(async () => {
    await trpc.artist.create.mutate({ ...artistForm.value, birth: formatted.value })

    router.push({ name: 'Home' })
  })
}

const submitArtist = () => {
  tryCatch(async () => {
    await trpc.request.create.add.mutate({
      entity: 'ARTIST',
      info: info.value,
      ...artistForm.value,
      birth: formatted.value,
    })

    router.push({ name: 'Home' })
  })
}

onBeforeMount(() => {
  countryList.value = getCountryDataList().map((c) => c.name)
})
</script>

<template>
  <v-container>
    <div>
      <h4>Create a new artist</h4>

      <div class="mt-6">
        <v-text-field
          type="text"
          v-model="artistForm.name"
          variant="solo-filled"
          placeholder="Artist name"
        />
      </div>
      <div>
        <v-date-input
          label="Date of birth (optional)"
          v-model="artistForm.birth"
          clearable
          @click:clear="artistForm.birth = null"
        ></v-date-input>
      </div>
      <div class="mt-6">
        <v-select
          clearable
          v-model="artistForm.origin"
          :items="countryList"
          variant="solo-filled"
          label="Place of birth (optional)"
        ></v-select>
      </div>
      <v-textarea
        v-model="info"
        label="Provide source(s) and/or clarification."
        variant="solo-filled"
      ></v-textarea>
    </div>

    <v-row justify="center">
      <v-col cols="auto">
        <v-btn v-if="userStore.isAdmin" @click.prevent="createArtist" type="submit" color="#00897B"
          >Create</v-btn
        >
      </v-col>
      <v-col cols="auto">
        <v-btn @click.prevent="submitArtist" type="submit" color="#00897B">Submit request</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
