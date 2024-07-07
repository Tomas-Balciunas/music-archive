<script lang="ts" setup>
import { trpc } from '@/trpc'
import { onBeforeMount, ref } from 'vue'
import { type ReviewFull } from '@mono/server/src/shared/entities'
import { useRoute } from 'vue-router'
import { tryCatch } from '@/composables'

const route = useRoute()
const reviewId = Number(route.params.id)
const review = ref<ReviewFull>()

onBeforeMount(async () => {
  tryCatch(async () => {
    review.value = await trpc.review.get.query(reviewId)
  })
})
</script>

<template>
  <div v-if="review">
    <RouterLink :to="{ name: 'Album', params: { id: review.albumId } }"
      ><h1 class="text-amber">{{ review.album.title }}</h1></RouterLink
    >
    <h3>{{ review.score }}%</h3>
    <p>{{ review.title }}</p>
    <p>{{ review.body }}</p>
  </div>
</template>

<style></style>
