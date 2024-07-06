<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotifComponent from '@/components/NotifComponent.vue'
import Navi from './components/Navi.vue'
import FooterBase from './components/FooterBase.vue'
</script>

<template>
  <v-app>
    <Navi />
    <v-main class="d-flex flex-column justify-space-between">
      <v-container>
        <RouterView />
      </v-container>
      <FooterBase />
    </v-main>
  </v-app>
  <NotifComponent />
</template>
<style>
</style>
