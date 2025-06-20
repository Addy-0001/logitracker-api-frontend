<script setup>
import BottomNavigation from './components/BottomNavigation.vue'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div>
    <Navbar />
    <div style="height: 100vh; margin-top: 70px;">
      <RouterView />
    </div>
    <BottomNavigation />
  </div>
</template>

<style scoped></style>
