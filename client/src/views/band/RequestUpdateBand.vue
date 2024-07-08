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

const approveChanges = async () => {
  tryCatch(async () => {
    await trpc.request.update.approve.mutate({ id: r.value.id, entity: r.value.entity })
    router.push({ name: 'Requests', query: { entity: 'band', request: 'update' } })
  })
}

const rejectChanges = async () => {
  tryCatch(async () => {
    await trpc.request.update.reject.mutate(rId)
    router.push({ name: 'Requests', query: { entity: 'band', request: 'update' } })
  })
}

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.update.get.query(rId)
    b.value = await trpc.band.get.query(r.value.entityId)
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
    <p>Band update data:</p>

    <v-container>
      <v-row v-for="(c, i) in r.comparison" :key="i">
        <v-card variant="text">
          <p>{{ i }}:</p>
          <v-card-title> <span class="text-amber">Old:</span> {{ c.old }} </v-card-title>
          <v-card-title> <span class="text-green">New:</span> {{ c.new }} </v-card-title>
        </v-card>
      </v-row>
    </v-container>

    <v-container v-if="r.artists.length">
      <p>New artists:</p>
      <v-card
        variant="text"
        rounded="0"
        class="lists"
        :to="{ name: 'Artist', params: { id: artist.id } }"
        v-for="artist in r.artists"
        :key="artist.id"
      >
        <v-card-item>
          <v-card-title> {{ artist.name }} </v-card-title>
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
