<script lang="ts" setup>
import { trpc } from '@/trpc'
import { useRoute } from 'vue-router'
import { onBeforeMount, ref } from 'vue'
import { type AlbumFull } from '@mono/server/src/shared/entities'
import { tryCatch } from '@/composables'

const route = useRoute()
const album = ref<AlbumFull>()
const albumId = Number(route.params.id)
const tab = ref('')

const toMinutes = (duration: number) => {
  const min = Math.floor(duration / 60)
  const sec = duration % 60

  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`
}

const updateAlbum = async () => {
  tryCatch(async () => {
    album.value = await trpc.album.get.query(albumId)
  })
}

onBeforeMount(async () => {
  await updateAlbum()
})
</script>

<template>
  <v-container v-if="album">
    <v-row align-sm="center" justify="space-between">
      <h1 class="text-amber">{{ album.title }}</h1>

      <div>
        <v-btn color="#00897B" :to="{ name: 'AlbumUpdate', params: { id: albumId } }">Update</v-btn>
      </div>
    </v-row>

    <v-container>
      <v-card variant="text" rounded="0">
        <v-card-item>
          <v-card-title>
            <RouterLink :to="{ name: 'Band', params: { id: album.bandId } }">
              <span class="text-amber">← {{ album.band.name }}</span>
            </RouterLink>
          </v-card-title>
          <v-card-title> Released in: {{ album.released }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-row class="mt-5">
      <v-tabs v-model="tab" class="requests" color="amber" align-tabs="center">
        <v-tab size="large" value="songs">songs</v-tab>
        <v-tab size="large" value="artists">artists</v-tab>
      </v-tabs>
    </v-row>

    <v-tabs-window class="requests" v-model="tab">
      <v-tabs-window-item value="songs">
        <v-container v-if="album.songs.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            v-for="song in album.songs"
            :key="song.id"
          >
            <v-card-item>
              <v-card-title> {{ song.title }} {{ toMinutes(song.duration) }} </v-card-title>
            </v-card-item>
          </v-card>
        </v-container>
        <v-container v-else>
          <v-col>
            <p>No songs found.</p>
          </v-col>
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item value="artists">
        <v-container v-if="album.artists.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            :to="{ name: 'Artist', params: { id: artist.id } }"
            v-for="artist in album.artists"
            :key="artist.id"
          >
            <v-card-item>
              <v-card-title> {{ artist.name }} </v-card-title>
            </v-card-item>
          </v-card>
        </v-container>
        <v-container v-else>
          <v-col>
            <p>No artists found.</p>
          </v-col>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-row class="mt-2">
      <p>Reviews</p>
    </v-row>

    <v-container v-if="album.reviews.length">
      <v-card
        v-for="review in album.reviews"
        :key="review.id"
        :to="{ name: 'Review', params: { id: review.id } }"
        class="lists mb-2 mt-2"
      >
        <v-card-item>
          <v-card-title> {{ review.score }}% {{ review.title }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-container v-else>
      <v-row>
        <v-col>
          <small>No reviews found.</small>
        </v-col>
      </v-row>
    </v-container>

    <v-container>
      <v-btn :to="{ name: 'ReviewCreate', params: { id: albumId } }" type="submit" color="#00897B">
        Write a review
      </v-btn>
    </v-container>
  </v-container>
</template>

<style></style>
