<script lang="ts" setup>
const icons = ['mdi-facebook', 'mdi-twitter', 'mdi-linkedin', 'mdi-instagram']
</script>
<template>
  <v-container class="test">
    <v-footer class="d-flex flex-column footer pb-0 pl-0 pr-0 pt-0">
      <div class="bg-teal-darken-4 d-flex w-100 align-center px-4">
        <p>Footer placeholder text</p>

        <v-spacer></v-spacer>

        <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          class="mx-4"
          size="small"
          variant="plain"
        ></v-btn>
      </div>

      <div class="w-100 bg-black px-4 py-2 text-center">
        {{ new Date().getFullYear() }} — <span>Vuetify</span>
      </div>
    </v-footer>
  </v-container>
</template>

<style>
.test {
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  padding: 0 !important;
}
</style>
