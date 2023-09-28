<script setup>
import { onMounted, reactive } from 'vue';

const emit = defineEmits(['article_selected']);
const props = defineProps({
    modal_id: {
        type: String,
        required: true
    },
    article: {
        type: Object,
        required: false
    }
});
const state = reactive({
    selected_quantity: 1,
});

onMounted(() => {
    state.selected_quantity = 1;
});

function selectArticle() {
    emit('article_selected', props.article?.id, state.selected_quantity);
}

function reset() {
    state.selected_quantity = 1;
}

function IncrementArticleQty() {
    if (state.selected_quantity < props.article.quantity) {
        state.selected_quantity++;
    }
    if (state.selected_quantity > props.article.quantity) {
        state.selected_quantity = 0;
    }
}

function DecrementArticleQty() {
    if (state.selected_quantity > 1 && state.selected_quantity <= props.article.quantity) {
        state.selected_quantity--;
    }
}

function verifyQuantity() {
    if (state.selected_quantity >= props.article.quantity) {
        state.selected_quantity = props.article.quantity;
    }
    if (state.selected_quantity <= 1) {
        state.selected_quantity = 1;
    }
}

</script>

<template>
    <input type="checkbox" :id="props.modal_id" class="modal-toggle" />
    <div class="modal">
        <div class="modal-box text-center">
            <label :for="props.modal_id" @click="reset" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
            <h3 class="text-lg font-bold text-center">{{ props.article?.name }}</h3>
            <p class="label-text my-3">Quantité de Départ : {{ props.article?.quantity }}</p>
            <p class="label-text my-3">Ajuster la quantité à transférer</p>
            <div>
                <label>
                    <span @click="DecrementArticleQty" class="btn btn-square mr-2">-</span>
                    <input @change="verifyQuantity" v-model="state.selected_quantity" type="number"
                        class="input input-bordered text-center" />
                    <span @click="IncrementArticleQty" class="btn btn-square ml-2">+</span>
                </label>
                <p class="label-text my-3">Quantité Restante : {{ props.article?.quantity - state.selected_quantity }}
                </p>

            </div>
            <label :for="props.modal_id" @click="selectArticle()" class="btn btn-primary mt-4 btn-block">Valider</label>
        </div>
    </div>

</template>