<script setup>
</script>

<template>
  <div class="navbar bg-base-100" style="height: 10vh;">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
          <li>
            <router-link tag="a" :to="{ name: 'operations' }" exact><a>Operations</a></router-link>
          </li>
          <li>
            <router-link tag="a" :to="{ name: 'warehouses' }" exact><a>Entrepots</a></router-link>
          </li>
        </ul>
      </div>
      <a @click="$router.push({ 'name': 'dashboard' })" class="btn btn-ghost normal-case text-xl">WAREHOUSE SYSTEM</a>
      <p class="normal-case hidden md:block text-xl">||</p>
      <p class="font-semibold hidden md:block normal-case text-xl">&nbsp; Stock</p>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal p-0">
        <li>
          <router-link tag="a" :to="{ name: 'operations' }" exact><a>Operations</a></router-link>
        </li>
        <li>
          <router-link tag="a" :to="{ name: 'warehouses' }" exact><a>Entrepots</a></router-link>
        </li>
      </ul>
    </div>
    <div class="navbar-end">
      <a class="btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
        </svg>
      </a>
    </div>
  </div>
</template>