<script lang="ts" setup>
import { tryCatch } from '@/composables';
import { trpc } from '@/trpc'
import { format } from 'date-fns'
import { onBeforeMount, ref } from 'vue'
import { RouterLink } from 'vue-router'

const r = ref()

onBeforeMount(async () => {
  tryCatch(async () => {
    r.value = await trpc.request.create.find.query('ALBUM')
  })
})
</script>

<template>
  <v-card v-if="r">
    <div v-for="req in r" :key="req.id">
      <RouterLink :to="{ name: 'AlbumCreateReq', params: { id: req.id } }">
        <v-card class="mt-2">
          <v-card-item>
            <v-card-title>
              {{ req.data.title }}
            </v-card-title>
            <v-card-subtitle>
              Time created {{ format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm:ss') }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
      </RouterLink>
    </div>
  </v-card>
</template>
