<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="text-xl font-bold text-blue-600">Palgend</NuxtLink>
          <div class="flex space-x-4">
            <NuxtLink to="/bills" class="text-gray-600 hover:text-blue-600">记账管理</NuxtLink>
            <NuxtLink to="/clients" class="text-gray-600 hover:text-blue-600">客户管理</NuxtLink>
            <NuxtLink to="/projects" class="text-gray-600 hover:text-blue-600">项目台账</NuxtLink>
          </div>
        </div>
      </nav>
    </header>
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
