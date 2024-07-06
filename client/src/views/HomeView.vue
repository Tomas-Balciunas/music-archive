<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import type { BandMinimal } from '@mono/server/src/shared/entities'
import { trpc } from '@/trpc'
import Band from '@/components/Band.vue'

const bands = ref<BandMinimal[]>([])
const length = ref(1)
const page = ref(1)

async function fetchBands() {
  length.value = await trpc.band.count.query()
  bands.value = await trpc.band.find.query(page.value)
}

onBeforeMount(async () => {
  await fetchBands()
})
</script>

<template>
  <h2 class="text-center mb-5">LIST OF BANDS</h2>
  <div v-if="bands.length">
    <v-row v-for="entry in bands" :key="entry.id">
      <v-col cols="12">
        <Band :band="entry" />
      </v-col>
    </v-row>

    <div class="text-center">
      <v-container>
        <v-row justify="center">
          <v-col cols="8">
            <v-container class="max-width">
              <v-pagination
                @click.prevent="fetchBands()"
                v-model="page"
                :length="length"
                :total-visible="7"
                class="my-4"
              ></v-pagination>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
  <h5 v-else>No bands found.</h5>
</template>
