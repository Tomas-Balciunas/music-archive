<script lang="ts" setup>
import type { BandMinimal } from '@mono/server/src/shared/entities'

defineProps<{
  band: BandMinimal
}>()
</script>

<template>
  <v-card
    :to="{ name: 'Band', params: { id: band.id } }"
    variant="outlined"
    rounded="0"
    class="lists"
  >
    <v-card-item>
      <v-card-title>
        {{ band.name }}
      </v-card-title>
    </v-card-item>
  </v-card>
</template>

<style>
</style>
