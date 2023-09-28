<script setup>
import { db } from '@/firebase'
import { collection, query, onSnapshot } from "firebase/firestore";
import { onMounted, reactive } from 'vue';

const emit = defineEmits(['article_selected']);
const props = defineProps({
    modal_id: {
        type: String,
        required: true
    },
    warehouse_stock: {
        type: Array,
        required: false
    }
});
const state = reactive({
    articles: [],
    origin_inventory: [],
});

const collection_query = query(collection(db, "inventory"));

onMounted(() => {
    if (props.warehouse_stock)
        state.articles = props.warehouse_stock;
    else
        onSnapshot(collection_query, (querySnapshot) => {
            state.articles = [];
            querySnapshot.forEach((doc) => {
                state.articles.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        });

    console.log(state.articles);
});


function selectArticle(article) {
    emit('article_selected', article);
}
</script>

<template>
    <input type="checkbox" :id="props.modal_id" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box relative">
            <label :for="props.modal_id" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <div class="p-3 grid md:grid-cols-3 gap-3">
                <label v-for="article in state.articles" @click="selectArticle(article)" :for="props.modal_id"
                    class="btn h-32">
                    <h2 class="text-xl text-white">
                        {{ article?.name }}
                    </h2>
                </label>
            </div>
        </div>
    </div>
</template>