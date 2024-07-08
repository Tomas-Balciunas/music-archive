<script lang="ts" setup>
import { tryCatch } from '@/composables'
import { trpc } from '@/trpc'
import type { ArtistFull } from '@mono/server/src/shared/entities'
import { onBeforeMount } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const artist = ref<ArtistFull>()
const artistId = Number(route.params.id)
const tab = ref('')

onBeforeMount(async () => {
  tryCatch(async () => {
    artist.value = await trpc.artist.get.query(artistId)
  })
})
</script>

<template>
  <v-container v-if="artist">
    <v-row align-sm="center" justify="space-between">
      <h1 class="text-amber">{{ artist.name }}</h1>

      <div>
        <v-btn color="#00897B" :to="{ name: 'ArtistUpdate', params: { id: artistId } }">Update</v-btn>
      </div>
    </v-row>

    <v-container>
      <v-card variant="text" rounded="0">
        <v-card-item>
          <v-card-title> Date of birth: {{ artist.birth ?? 'N/A' }} </v-card-title>
          <v-card-title> Place of birth: {{ artist.origin ?? 'N/A' }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-row class="mt-5">
      <v-tabs v-model="tab" class="requests" color="amber" align-tabs="center">
        <v-tab size="large" value="bands">bands</v-tab>
        <v-tab size="large" value="albums">albums</v-tab>
      </v-tabs>
    </v-row>

    <v-tabs-window class="requests" v-model="tab">
      <v-tabs-window-item value="bands">
        <v-container v-if="artist.bands.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            v-for="band in artist.bands"
            :key="band.id"
            :to="{ name: 'Band', params: { id: band.id } }"
          >
            <v-card-item>
              <v-card-title> {{ band.name }} </v-card-title>
            </v-card-item>
          </v-card>
        </v-container>
        <v-container v-else>
          <v-col>
            <p>No bands found.</p>
          </v-col>
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item value="albums">
        <v-container v-if="artist.albums.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            :to="{ name: 'Album', params: { id: album.id } }"
            v-for="album in artist.albums"
            :key="album.id"
          >
            <v-card-item>
              <v-card-title> {{ album.title }} </v-card-title>
            </v-card-item>
          </v-card>
        </v-container>
        <v-container v-else>
          <v-col>
            <p>No albums found.</p>
          </v-col>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>
