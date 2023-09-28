<script setup>
import { db } from '@/firebase'
import { query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useOperationStore } from '@/store/operation';

const $route = useRoute();
const state = reactive({
    articles: [],
    warehouse: {}
});
// store warehouse id from url
const warehouse_id = $route.params.warehouse_id;

// fetch inventory of warehouse from firestore
useOperationStore().get_warehouse_inventory({ id: warehouse_id }).then((data) => {
    console.log(data);
    state.articles = data;
});

// fetch warehouse name from firestore
useOperationStore().get_warehouse(warehouse_id).then((data) => {
    console.log(data);
    state.warehouse = data;
});
</script>

<template>
        <div class="hero bg-base-200 pt-14">
            <div class="hero-content text-center">
                <div class="max-w-md">
                    <h1 class="text-5xl font-bold">{{state.warehouse.name}}</h1>
                    <p class="py-6"></p>
                </div>
            </div>
        </div>
    <div class="hero bg-base-200 pt-14">
        <div class="hero-content text-center">
            <div class="max-w-md">
                <h3 class="text-3xl font-bold">Inventaire</h3>
                <p class="py-6"></p>
            </div>
        </div>
    </div>
    <div class="overflow-x-auto w-full">
        <div class="text-center bg-base-200">
            <button class="btn md:w-96 gap-2" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                Nouvel Article
            </button>
        </div>
        <table class="table w-full">
            <!-- head -->
            <thead>
                <tr>
                    <th></th>
                    <th>Article</th>
                    <th>Quantité</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="article in state.articles">
                    <td>
                        <button class="btn btn-ghost btn-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>

                        </button>
                    </td>
                    <td>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img src="https://placeimg.com/56/56/arch" alt="Avatar Tailwind CSS Component" />
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">{{ article?.name }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge badge-success badge-lg">x{{ article?.quantity }}</span>
                    </td>

                </tr>
            </tbody>
            <!-- foot -->
            <tfoot>
            </tfoot>
        </table>
    </div>
</template>