<script setup>
import { db } from '@/firebase'
import { collection, query, onSnapshot } from "firebase/firestore";
import { reactive } from 'vue';

const state = reactive({
    warehouses: [],
});

const collection_query = query(collection(db, "warehouses"));
onSnapshot(collection_query, (querySnapshot) => {
    let temp_warehouses = [];
    querySnapshot.forEach((doc) => {
        temp_warehouses.push({ id: doc.id, name: doc.data().name });
    });
    state.warehouses = temp_warehouses;
    console.log(state.warehouses);
});
</script>

<template>
    <div class="hero bg-base-200 pt-14">
        <div class="hero-content text-center">
            <div class="max-w-md">
                <h1 class="text-5xl font-bold">Entrepôts</h1>
                <p class="py-6">Gérer et visualiser le stock de tous vos entrepôts</p>
            </div>
        </div>
    </div>
    <div class="p-12">
        <div class="flex flex-col w-full lg:flex-row text-center text-3xl">
            <div class="bg-base-200 rounded w-full">
                <ul class="grid grid-cols-1 p-5 gap-2 md:gap-6 md:grid-cols-3 md:p-14">
                    {{ state.warehouses.data }}
                    <li v-for="warehouse in state.warehouses" style="cursor: pointer;"
                        class="col-span-1 flex flex-col text-center">
                        <div @click="$router.push({ name: 'warehouse', params: { warehouse_id: warehouse?.id } })"
                            class="glass bg-base-100 card shadow-xl">
                            <div class="card-body items-center text-center">
                                <h2 class="card-title">{{ warehouse?.name }}</h2>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>