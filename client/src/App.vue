<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotifComponent from '@/components/NotifComponent.vue'
import Navi from './components/Navi.vue'
</script>

<template>
  <v-app>
    <Navi />
    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
  <NotifComponent />
</template>
