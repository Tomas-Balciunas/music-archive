<script lang="ts" setup>
import { tryCatch } from '@/composables';
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { RouterLink } from 'vue-router'

const r = ref()

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.update.find.query('ARTIST')
  })
})
</script>

<template>
  <div v-if="r">
    <div v-for="req in r" :key="req.id">
      <RouterLink :to="{ name: 'ArtistUpdateReq', params: { id: req.id } }">
        <v-card class="mt-2">
          <v-card-item>
            <v-card-title>{{ req.artist_name }}</v-card-title>
            <v-card-subtitle>
              {{ req.created_at }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </RouterLink>
    </div>
  </div>
</template>
