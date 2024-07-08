<script lang="ts" setup>
import { ref } from 'vue'
import type { ArtistBare, SongInsert } from '@mono/server/src/shared/entities'
import { tryCatch } from '@/composables'
import { trpc } from '@/trpc'
import { useRoute, useRouter } from 'vue-router'
import { onBeforeMount } from 'vue'
import { useNotifStore } from '@/stores/notif'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const notifStore = useNotifStore()
const route = useRoute()
const router = useRouter()
const bandId = Number(route.params.id)
const band = ref()

const toSeconds = () => {
  return parseInt(songForm.value.minutes) * 60 + parseInt(songForm.value.seconds)
}

const songForm = ref({
  title: '',
  minutes: '',
  seconds: '',
})

const addSong = () => {
  songList.value.push({ title: songForm.value.title, duration: toSeconds() })
}

const toMinutes = (duration: number) => {
  const min = Math.floor(duration / 60)
  const sec = duration % 60

  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`
}

const albumForm = ref({
  title: '',
  released: null,
})
const artistList = ref<Pick<ArtistBare, 'id' | 'name'>[]>([])
const songList = ref<Omit<SongInsert, 'album'>[]>([])

const addArtist = async (artistId: number, name: string) => {
  const a = { id: artistId, name }

  if (!artistList.value.some((e) => e.id === a.id)) {
    artistList.value.push(a)
  } else {
    notifStore.showNotif('This artist has already been added!')
  }
}
const searchResults = ref<ArtistBare[]>([])
const searchForm = ref('')

const search = async () => {
  tryCatch(async () => {
    if (searchForm.value === '') {
      searchResults.value = []
    } else {
      searchResults.value = await trpc.artist.search.query({ name: searchForm.value, bandId })
    }
  })
}

const removeArtist = (i: number) => {
  artistList.value.splice(i, 1)
}

const removeSong = (i: number) => {
  songList.value.splice(i, 1)
}

function createAlbum() {
  tryCatch(async () => {
    await trpc.album.create.mutate({
      songs: songList.value,
      artists: artistList.value,
      bandId,
      ...albumForm.value,
    })

    router.push({ name: 'Band', params: { id: bandId } })
  })
}

const submitRequest = () => {
  tryCatch(async () => {
    await trpc.request.create.add.mutate({
      entity: 'ALBUM',
      ...albumForm.value,
      artists: artistList.value,
      songs: songList.value,
      bandId,
      info: 'test',
    })

    notifStore.showNotif('Request has been submitted.')
    router.push({ name: 'Band', params: { id: bandId } })
  })
}

onBeforeMount(async () => {
  tryCatch(async () => {
    band.value = await trpc.band.get.query(bandId)
  })
})
</script>

<template>
  <v-container v-if="band">
    <v-row v-if="band.pending">
      <v-alert type="warning" class="text-h6">
        Band is in pending state, only admins can update data.
      </v-alert>
    </v-row>
    <v-row align-sm="center" justify="space-between">
      <div class="d-flex align-center">
        <v-col>
          <h2 class="text-amber mr-2">{{ band.name }}</h2>
        </v-col>

        <v-tooltip v-if="band.pending" text="Band is awaiting approval." location="bottom">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" icon="mdi-receipt-clock-outline"></v-icon>
          </template>
        </v-tooltip>
      </div>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <v-text-field label="Album title" v-model="albumForm.title"></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-number-input label="Released in" v-model="albumForm.released"></v-number-input>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="3">
        <small>Band line-up:</small>
        <div v-for="artist in band.artists" :key="artist.id">
          <v-checkbox
            hide-details
            density="compact"
            v-model="artistList"
            :label="artist.name"
            :value="{ id: artist.id, name: artist.name }"
          ></v-checkbox>
        </div>
        <p class="not-found" v-if="!band.artists.length">No artists found.</p>

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

      <v-col cols="3">
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

      <v-col cols="3">
        <small>Added songs:</small>
        <v-card
          density="compact"
          rounded="0"
          variant="plain"
          v-for="(song, i) in songList"
          :key="song.title"
        >
          <v-card-title class="pa-0 pl-2">
            <span class="list-list text-green"
              >{{ song.title }} {{ toMinutes(song.duration) }}</span
            >
            <v-btn density="compact" icon class="ml-2" @click.prevent="removeSong(i)">X</v-btn>
          </v-card-title>
        </v-card>
      </v-col>

      <v-col cols="3">
        <v-text-field label="Song title" variant="solo-filled" v-model="songForm.title" clearable />
        <v-text-field
          type="number"
          label="Minutes"
          variant="solo-filled"
          v-model="songForm.minutes"
        />
        <v-text-field
          type="number"
          label="Seconds"
          variant="solo-filled"
          v-model="songForm.seconds"
        />
        <v-btn @click.prevent="addSong" type="submit" color="#00897B">Add song</v-btn>
      </v-col>
    </v-row>
  </v-container>

  <v-row justify="center">
    <v-col cols="auto">
      <v-btn v-if="userStore.isAdmin" color="#00897B" @click.prevent="createAlbum()">Update</v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn color="#00897B" @click.prevent="submitRequest()">Submit request</v-btn>
    </v-col>
  </v-row>
</template>
