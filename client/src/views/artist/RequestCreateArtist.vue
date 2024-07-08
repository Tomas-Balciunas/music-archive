<script lang="ts" setup>
import { tryCatch } from '@/composables'
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const rId = Number(route.params.id)
const r = ref()

const approveChanges = async () => {
  tryCatch(async () => {
    await trpc.request.create.approve.mutate({ id: rId, entity: r.value.entity })
    router.push({ name: 'Requests', query: { entity: 'artist', request: 'create' } })
  })
}

const rejectChanges = async () => {
  tryCatch(async () => {
    await trpc.request.create.reject.mutate(rId)
    router.push({ name: 'Requests', query: { entity: 'artist', request: 'create' } })
  })
}

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.create.get.query(rId)
  })
})
</script>

<template>
  <v-container v-if="r">
    <p>Artist data:</p>
    <v-container>
      <v-card variant="text" rounded="0">
        <v-card-item>
          <v-card-title> Name: {{ r.data.name }} </v-card-title>
          <v-card-title> Birth: {{ r.data.birth ?? 'N/A' }} </v-card-title>
          <v-card-title> Country: {{ r.data.origin ?? 'N/A' }} </v-card-title>
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
