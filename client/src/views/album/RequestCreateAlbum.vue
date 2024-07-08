<script lang="ts" setup>
import { tryCatch } from '@/composables'
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const rId = Number(route.params.id)
const r = ref()
const b = ref()

const toMinutes = (duration: number) => {
  const min = Math.floor(duration / 60)
  const sec = duration % 60

  return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`
}

const approveChanges = async () => {
  tryCatch(async () => {
    await trpc.request.create.approve.mutate({
      id: rId,
      entity: r.value.entity,
    })

    router.push({ name: 'Requests', query: { entity: 'album', request: 'create' } })
  })
}

const rejectChanges = async () => {
  tryCatch(async () => {
    await trpc.request.create.reject.mutate(rId)
    router.push({ name: 'Requests', query: { entity: 'album', request: 'create' } })
  })
}

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.create.get.query(rId)
    b.value = await trpc.band.get.query(r.value.data.bandId)
  })
})
</script>

<template>
  <v-container v-if="r && b">
    <h2>
      <RouterLink :to="{ name: 'Band', params: { id: b.id } }"
        ><span class="text-amber">{{ b.name }}</span></RouterLink
      >
    </h2>
    <p>Album data:</p>
    <v-container>
      <v-card variant="text" rounded="0">
        <v-card-item>
          <v-card-title> Title: {{ r.data.title }} </v-card-title>
          <v-card-title> Released in: {{ r.data.released }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-container v-if="r.data.artists.length">
      <p>Artists:</p>
      <v-card
        variant="text"
        rounded="0"
        class="lists"
        :to="{ name: 'Artist', params: { id: artist.id } }"
        v-for="artist in r.data.artists"
        :key="artist.id"
      >
        <v-card-item>
          <v-card-title> {{ artist.name }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-container v-if="r.data.songs.length">
      <p>Songs:</p>
      <v-card variant="text" rounded="0" class="lists" v-for="song in r.data.songs" :key="song.id">
        <v-card-item>
          <v-card-title> {{ song.title }} {{ toMinutes(song.duration) }} </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>
    <div>
      <p>Reason and sources:</p>
      <p>{{ r.info }}</p>
    </div>

    <v-row justify="center">
      <v-col cols="auto">
        <v-btn color="#00897B" @click.prevent="approveChanges()">Approve</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="#B71C1C" @click.prevent="rejectChanges()">Reject</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
