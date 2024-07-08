<script lang="ts" setup>
import BandUpdateList from '@/components/requests/lists/BandUpdateList.vue'
import BandPendingList from '@/components/requests/lists/BandPendingList.vue'
import AlbumCreateList from '@/components/requests/lists/AlbumCreateList.vue'
import ArtistCreateList from '@/components/requests/lists/ArtistCreateList.vue'
import AlbumUpdateList from '@/components/requests/lists/AlbumUpdateList.vue'
import ArtistUpdateList from '@/components/requests/lists/ArtistUpdateList.vue'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tab = ref(route.query.request || 'create')
const creates = ref(route.query.entity)
const updates = ref(route.query.entity)

const updateQueryParam = (
  entity: string | LocationQueryValue | LocationQueryValue[],
  request: string | LocationQueryValue | LocationQueryValue[]
) => {
  router.push({ query: { entity, request } })
}

watch(
  () => route.query.request,
  (request) => {
    tab.value = request || 'create'
  }
)

watch([tab, creates, updates], ([newTab, newCreate, newUpdate]) => {
  if (newTab === 'create') {
    updateQueryParam(newCreate, 'create')
  }
  if (newTab === 'update') {
    updateQueryParam(newUpdate, 'update')
  }
})

onMounted(() => {
  if (route.query.request) {
    updateQueryParam(route.query.entity, route.query.request)
  }

  if (route.query.request) {
    updateQueryParam(route.query.entity, route.query.request)
  }
})
</script>

<template>
  <v-container>
    <v-tabs v-model="tab" class="requests" color="red-darken-4" align-tabs="center">
      <v-tab value="create">create requests</v-tab>
      <v-tab value="update">update requests</v-tab>
    </v-tabs>

    <v-tabs-window class="requests" v-model="tab">
      <v-tabs-window-item value="create">
        <v-tabs v-model="creates" color="red-darken-4" align-tabs="center">
          <v-tab value="band">Bands</v-tab>
          <v-tab value="album">Albums</v-tab>
          <v-tab value="artist">Artists</v-tab>
        </v-tabs>

        <v-tabs-window v-model="creates">
          <v-tabs-window-item value="band"><BandPendingList></BandPendingList></v-tabs-window-item>

          <v-tabs-window-item value="album">
            <AlbumCreateList></AlbumCreateList>
          </v-tabs-window-item>
          <v-tabs-window-item value="artist"
            ><ArtistCreateList></ArtistCreateList
          ></v-tabs-window-item>
        </v-tabs-window>
      </v-tabs-window-item>

      <v-tabs-window-item value="update">
        <v-tabs v-model="updates" color="red-darken-4" align-tabs="center">
          <v-tab value="band">Bands</v-tab>
          <v-tab value="album">Albums</v-tab>
          <v-tab value="artist">Artists</v-tab>
        </v-tabs>

        <v-tabs-window v-model="updates">
          <v-tabs-window-item value="band"><BandUpdateList></BandUpdateList></v-tabs-window-item>

          <v-tabs-window-item value="album">
            <AlbumUpdateList></AlbumUpdateList>
          </v-tabs-window-item>
          <v-tabs-window-item value="artist"
            ><ArtistUpdateList></ArtistUpdateList
          ></v-tabs-window-item>
        </v-tabs-window>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<style>
.requests {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 20px;
}
</style>
