<script lang="ts" setup>
import { tryCatch } from '@/composables'
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const rId = Number(route.params.id)
const r = ref()
const a = ref()

const approveChanges = async () => {
  tryCatch(async () => {
    await trpc.request.update.approve.mutate({ id: r.value.id, entity: 'ARTIST' })
    router.push({ name: 'Requests', query: { entity: 'artist', request: 'update' } })
  })
}

const rejectChanges = async () => {
  tryCatch(async () => {
    await trpc.request.update.reject.mutate(rId)
    router.push({ name: 'Requests', query: { entity: 'artist', request: 'update' } })
  })
}

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.update.get.query(rId)
    a.value = await trpc.artist.get.query(r.value.entityId)
  })
})
</script>

<template>
  <v-container v-if="r && a">
    <h2>
      <RouterLink :to="{ name: 'Artist', params: { id: a.id } }"
        ><span class="text-amber">{{ a.name }}</span></RouterLink
      >
    </h2>
    <p>Artist update data:</p>

    <v-container>
      <v-row v-for="(c, i) in r.comparison" :key="i">
        <v-card variant="text">
          <p>{{ i }}:</p>
          <v-card-title> <span class="text-amber">Old:</span> {{ c.old }} </v-card-title>
          <v-card-title> <span class="text-green">New:</span> {{ c.new }} </v-card-title>
        </v-card>
      </v-row>
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
