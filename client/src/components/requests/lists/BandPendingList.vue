<script lang="ts" setup>
import { tryCatch } from '@/composables';
import { trpc } from '@/trpc'
import { format } from 'date-fns'
import { onBeforeMount, ref } from 'vue'

const bands = ref()

onBeforeMount(async () => {
  tryCatch(async () => {
    bands.value = await trpc.band.findPending.query()
  })
})
</script>

<template>
  <div v-if="bands">
    <div v-for="b in bands" :key="b.id">
        <v-card hover class="mt-2" :to="{ name: 'Band', params: { id: b.id } }">
          <v-card-item>
            <v-card-title>
              <span>{{ b.name }}</span>
            </v-card-title>
            <v-card-subtitle>
              Time created {{ format(new Date(b.createdAt), 'yyyy-MM-dd HH:mm:ss') }}
            </v-card-subtitle>
          </v-card-item>
        </v-card>
    </div>
  </div>
</template>
