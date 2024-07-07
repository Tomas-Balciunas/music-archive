<script setup lang="ts">
import { trpc } from '@/trpc'
import { onBeforeMount, ref, type Ref } from 'vue'
import type { BandFull, PostInsert } from '@mono/server/src/shared/entities'
import { useRoute, useRouter } from 'vue-router'
import { makeInsert, tryCatch } from '@/composables'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const band = ref<BandFull>()
const route = useRoute()
const router = useRouter()
const bandId = Number(route.params.id)

const postForm = ref({
  body: '',
})

const postInsert: Ref<PostInsert> = makeInsert(postForm.value, { bandId })

const createComment = async () => {
  tryCatch(async () => {
    await trpc.post.create.mutate(postInsert.value)
  })

  await updateBand()
}

const approveBand = async () => {
  if (band.value) {
    const bandValue = band.value

    tryCatch(async () => {
      await trpc.band.status.mutate({ id: bandValue.id, pending: false })
    })

    router.push({ name: 'Requests' })
  }
}

const updateBand = async () => {
  tryCatch(async () => {
    band.value = await trpc.band.get.query(bandId)
  })
}

const tab = ref('')

onBeforeMount(async () => {
  await updateBand()
})
</script>

<template>
  <v-container v-if="band">
    <v-row align-sm="center" justify="space-between">
      <h1 class="text-amber">{{ band.name }}</h1>

      <div>
        <v-btn class="mr-2" color="#00897B" :to="{ name: 'BandUpdate', params: { id: bandId } }">Update</v-btn>
        <v-btn color="#00897B" v-if="band.pending" @click.prevent="approveBand">Approve</v-btn>
      </div>
    </v-row>

    <v-container>
      <v-card variant="text" rounded="0">
        <v-card-item>
          <v-card-title> Formed in: {{ band.formed ?? 'N/A' }} </v-card-title>
          <v-card-title> Originated in: {{ band.origin ?? 'N/A' }} </v-card-title>
          <v-card-title>
            Status:
            <span :class="{ 'band-status-active': band.status === 'active' }">
              {{ band.status }}
            </span>
          </v-card-title>
        </v-card-item>
      </v-card>
    </v-container>

    <v-row class="mb-3 mt-3">
      <p class="band-info">{{ band.description }}</p>
    </v-row>

    <v-divider></v-divider>

    <v-row class="mt-5">
      <v-tabs v-model="tab" class="requests" color="amber" align-tabs="center">
        <v-tab size="large" value="albums">albums</v-tab>
        <v-tab size="large" value="artists">artists</v-tab>
      </v-tabs>
    </v-row>

    <v-tabs-window class="requests" v-model="tab">
      <v-tabs-window-item value="albums">
        <v-container v-if="band.albums.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            :to="{ name: 'Album', params: { id: album.id } }"
            v-for="album in band.albums"
            :key="album.id"
          >
            <v-card-item>
              <v-card-title> {{ album.title }} ({{ album.released }}) </v-card-title>
            </v-card-item>
          </v-card>
        </v-container>
        <v-container v-else>
          <v-col>
            <p>No albums found.</p>
          </v-col>
        </v-container>
        <v-container>
          <v-btn color="#00897B" class="mt-4" :to="{ name: 'AlbumCreate', params: { id: bandId } }">
            Add album
          </v-btn>
        </v-container>
      </v-tabs-window-item>

      <v-tabs-window-item value="artists">
        <v-container v-if="band.artists.length">
          <v-card
            variant="text"
            rounded="0"
            class="lists"
            :to="{ name: 'Artist', params: { id: artist.id } }"
            v-for="artist in band.artists"
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

    <v-divider></v-divider>

    <v-row class="mt-2">
      <p>Comments</p>
    </v-row>

    <v-container v-if="band.posts.length">
      <v-card v-for="post in band.posts" :key="post.id" class="mb-2 mt-2">
        <v-card-item>
          <v-card-subtitle>
            {{ String(post.createdAt).slice(0, 19).replace('T', ' ') }}
          </v-card-subtitle>
        </v-card-item>
        <v-card-title>
          {{ post.body }}
        </v-card-title>
      </v-card>
    </v-container>
    <v-row v-else>
      <v-col>
        <small>No comments found.</small>
      </v-col>
    </v-row>

    <v-row>
      <p>Add user comment</p>
    </v-row>
    <v-container v-if="!band.pending && userStore.isLoggedIn">
      <v-row>
        <v-col cols="8 ">
          <v-textarea rows="2" variant="solo-filled" v-model="postForm.body"></v-textarea>
        </v-col>
      </v-row>

      <v-btn @click.prevent="createComment" type="submit" color="#C62828" class="basicBtn">
        Save
      </v-btn>
    </v-container>
  </v-container>
</template>

<style>
.band-info {
  font-size: 20px;
}
</style>
