<script lang="ts" setup>
import router from '@/router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

function logoutUser() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <v-app-bar :elevation="2">
    <template v-slot:prepend>
      <v-app-bar-nav-icon>
        <v-btn :to="{ name: 'Home' }" :active="false" icon>
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </v-app-bar-nav-icon>
    </template>

    <v-app-bar-title> <span class="navTitle">Music Archive</span> </v-app-bar-title>

    <v-tooltip v-if="userStore.isLoggedIn" text="Logout" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" @click.prevent="logoutUser" icon>
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
    </v-tooltip>

    <div v-else>
      <v-tooltip text="Login" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" :to="{ name: 'Login' }" icon>
            <v-icon>mdi-login</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Signup" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" :to="{ name: 'Signup' }" icon>
            <v-icon>mdi-file-sign</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </v-app-bar>

  <v-navigation-drawer class="navi" expand-on-hover rail>
    <v-list>
      <v-list-item
        prepend-avatar="https://icons.veryicon.com/png/o/internet--web/three-body-project-icon/user-126.png"
        :title="userStore.isLoggedIn ? userStore.userIdentifier?.username : 'Guest'"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        :to="{ name: 'BandCreate' }"
        prepend-icon="mdi-folder-plus"
        title="Create a band"
        :active="false"
      ></v-list-item>
      <v-list-item
        :to="{ name: 'ArtistCreate' }"
        prepend-icon="mdi-folder-plus"
        title="Create an artist"
        :active="false"
      ></v-list-item>
      <v-list-item
        :to="{ name: 'Requests' }"
        prepend-icon="mdi-queue-first-in-last-out"
        title="Requests"
        :active="false"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style>
.navi {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-size: 18px;
}
.navTitle {
  color: #b71c1c;
  font-size: xx-large;
}
</style>
