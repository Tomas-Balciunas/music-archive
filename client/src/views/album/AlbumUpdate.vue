<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import type { ArtistBare, SongInsert } from '@mono/server/src/shared/entities'
import { useRoute, useRouter } from 'vue-router'
import { tryCatch } from '@/composables'
import { useUserStore } from '@/stores/user'
import { useNotifStore } from '@/stores/notif'

const album = ref()
const name = ref('')
const userStore = useUserStore()
const notifStore = useNotifStore()
const currentArtists = ref()
const currentSongs = ref()
const route = useRoute()
const router = useRouter()
const albumId = Number(route.params.id)

const searchResults = ref<ArtistBare[]>([])
const searchForm = ref('')

const songList = ref<Omit<SongInsert, 'album'>[]>([])
const artistList = ref<Pick<ArtistBare, 'id' | 'name'>[]>([])
const info = ref('')

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

const removeArtist = (i: number) => {
  artistList.value.splice(i, 1)
}

const removeSong = (i: number) => {
  songList.value.splice(i, 1)
}

const toMinutes = (duration: number) => {
  const min = Math.floor(duration / 60)
  const sec = duration % 60

  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`
}

const addArtist = async (artistId: number, name: string) => {
  const a = { id: artistId, name }

  if (!artistList.value.some((e) => e.id === a.id)) {
    artistList.value.push(a)
  } else {
    notifStore.showNotif('This artist has already been added!')
  }
}

const search = async () => {
  tryCatch(async () => {
    if (searchForm.value === '') {
      searchResults.value = []
    } else {
      searchResults.value = await trpc.artist.search.query({ name: searchForm.value, albumId })
    }
  })
}

function submitChanges() {
  if (album.value) {
    tryCatch(async () => {
      await trpc.album.update.mutate({
        albumId,
        songs: songList.value,
        artists: artistList.value,
        ...album.value,
      })

      router.push({ name: 'Album', params: { id: albumId } })
    })
  }
}

function submitRequest() {
  if (album.value) {
    tryCatch(async () => {
      await trpc.request.update.add.mutate({
        ...album.value,
        entity: 'ALBUM',
        entityId: albumId,
        artists: artistList.value,
        songs: songList.value,
        info: info.value,
      })

      notifStore.showNotif('Request has been submitted.')
      router.push({ name: 'Album', params: { id: albumId } })
    })
  }
}

onBeforeMount(async () => {
  tryCatch(async () => {
    const { artists, songs, ...data } = await trpc.album.get.query(albumId)
    name.value = data.title
    currentArtists.value = artists
    currentSongs.value = songs
    album.value = data
  })
})
</script>

<template>
  <v-container v-if="album">
    <v-row>
      <v-col cols="auto">
        <RouterLink :to="{ name: 'Album', params: { id: album.id } }">
          <h2 class="text-amber">{{ name }}</h2>
        </RouterLink>
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6">
        <v-text-field label="Album title" v-model="album.title"></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-number-input label="Released in" v-model="album.released"></v-number-input>
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
      <v-col cols="3">
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
        <small>Current songs:</small>
        <v-card
          density="compact"
          rounded="0"
          variant="plain"
          v-for="song in currentSongs"
          :key="song.id"
        >
          <v-card-title class="pa-0 pl-2">
            <span class="list-list">{{ song.title }} {{ toMinutes(song.duration) }}</span>
          </v-card-title>
        </v-card>
        <p class="not-found" v-if="!currentSongs.length">No songs found.</p>

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
