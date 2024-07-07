<script setup lang="ts">
import { watch, ref } from 'vue'
import { useNotifStore } from '@/stores/notif'

const notif = useNotifStore()

watch(
  () => notif.notif,
  () => {
    active.value = true
  }
)

const active = ref(false)
</script>

<template>
  <div id="notif">
    <v-alert
      v-model="active"
      type="info"
      rounded="0"
      color="amber"
      title="Alert title"
      closable
      @click:close="active = false"
    >
      <template v-slot:title>
        {{ notif.getNotif }}
      </template>
    </v-alert>
  </div>
</template>
<style scoped>
#notif {
  bottom: 0;
  width: 100%;
  position: fixed;
  z-index: 2005;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
</style>
