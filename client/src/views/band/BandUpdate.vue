<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import type { ArtistBare } from '@mono/server/src/shared/entities'
import { getCountryDataList } from 'countries-list'
import { useRoute, useRouter } from 'vue-router'
import { tryCatch } from '@/composables'
import { useNotifStore } from '@/stores/notif'
import { useUserStore } from '@/stores/user'

const band = ref()
const notifStore = useNotifStore()
const userStore = useUserStore()
const currentArtists = ref()
const route = useRoute()
const router = useRouter()
const bandId = Number(route.params.id)
const countryList = ref<string[]>([])

const searchResults = ref<ArtistBare[]>([])
const searchForm = ref('')

const artistList = ref<Pick<ArtistBare, 'id' | 'name'>[]>([])
const info = ref('')

const addArtist = async (artistId: number, name: string) => {
  const a = { id: artistId, name }

  if (!artistList.value.some((e) => e.id === a.id)) {
    artistList.value.push(a)
  } else {
    notifStore.showNotif('This artist has already been added!')
  }
}

const removeArtist = (i: number) => {
  artistList.value.splice(i, 1)
}

const search = async () => {
  tryCatch(async () => {
    if (searchForm.value === '') {
      searchResults.value = []
    } else {
      searchResults.value = await trpc.artist.search.query({ name: searchForm.value, bandId })
    }
  })
}

function submitChanges() {
  if (band.value) {
    tryCatch(async () => {
      await trpc.band.update.mutate({ bandId, artists: artistList.value, ...band.value })
      router.push({ name: 'Band', params: { id: bandId } })
    })
  }
}

function submitRequest() {
  if (band.value) {
    tryCatch(async () => {
      await trpc.request.update.add.mutate({
        ...band.value,
        entity: 'BAND',
        entityId: bandId,
        artists: artistList.value,
        info: info.value,
      })

      notifStore.showNotif('Request has been submitted.')
      router.push({ name: 'Band', params: { id: bandId } })
    })
  }
}

onBeforeMount(async () => {
  tryCatch(async () => {
    countryList.value = getCountryDataList().map((c) => c.name)
    const { artists, ...data } = await trpc.band.get.query(bandId)
    currentArtists.value = artists
    band.value = data
  })
})
</script>

<template>
  <v-container v-if="band">
    <v-row>
      <v-col cols="auto">
        <RouterLink :to="{ name: 'Band', params: { id: band.id } }">
          <h2 class="text-amber">{{ band.name }}</h2>
        </RouterLink>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-text-field label="Name" v-model="band.name"></v-text-field>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col
        ><v-textarea label="Description" rows="2" v-model="band.description"></v-textarea
      ></v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-number-input label="Formed in" v-model="band.formed"></v-number-input>
      </v-col>
      <v-col>
        <v-select
          clearable
          v-model="band.origin"
          :items="countryList"
          label="Country of origin"
        ></v-select>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col>
        <v-textarea
          v-model="info"
          rows="1"
          label="Provide source(s) and/or clarification for the changes."
          variant="solo-filled"
        ></v-textarea>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="4">
        <small>Current artists:</small>
        <v-card
          density="compact"
          rounded="0"
          variant="plain"
          v-for="artist in currentArtists"
          :key="artist.id"
          :to="{ name: 'Artist', params: { id: artist.id } }"
          target="_blank"
          class="lists"
        >
          <v-card-title class="pa-0 pl-2">
            <span class="list-list">{{ artist.name }}</span>
          </v-card-title>
        </v-card>
        <p class="not-found" v-if="!currentArtists.length">No artists found.</p>
      </v-col>
      <v-col cols="4">
        <small>Added artists:</small>
        <v-card
          density="compact"
          rounded="0"
          variant="plain"
          v-for="(artist, i) in artistList"
          :key="artist.id"
          :to="{ name: 'Artist', params: { id: artist.id } }"
          target="_blank"
          class="lists"
        >
          <v-card-title class="pa-0 pl-2">
            <span class="list-list text-green">{{ artist.name }}</span>
            <v-btn density="compact" icon class="ml-2" @click.prevent="removeArtist(i)">X</v-btn>
          </v-card-title>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-text-field
          append-inner-icon="mdi-magnify"
          label="Search for artists"
          variant="solo-filled"
          v-model="searchForm"
          @click:append-inner="search"
          clearable
          @click:clear="searchResults = []"
        />

        <v-card
          density="compact"
          rounded="0"
          variant="text"
          v-for="artist in searchResults"
          :key="artist.id"
        >
          <v-card-title class="pa-0 pl-2"
            ><v-btn
              density="compact"
              color="green"
              icon
              class="mb-1 mr-2"
              @click="addArtist(artist.id, artist.name)"
              >+</v-btn
            >
            <span>{{ artist.name }}</span>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="auto">
        <v-btn v-if="userStore.isAdmin" color="#00897B" @click.prevent="submitChanges()"
          >Update</v-btn
        >
      </v-col>
      <v-col cols="auto">
        <v-btn color="#00897B" @click.prevent="submitRequest()">Submit request</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<style></style>
