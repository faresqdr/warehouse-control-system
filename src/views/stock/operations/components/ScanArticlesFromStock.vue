<script setup>
import { onMounted, reactive } from 'vue';
import { db } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import AdjustArticleQuantity from '../components/AdjustArticleQuantity.vue';
import { useOperationStore } from '@/store/operation';
import * as _ from 'lodash';

const emit = defineEmits(['previous_step', 'step_validated']);
const props = defineProps({
    assigned_step_number: {
        type: Number,
        required: true,
    },
    origin_warehouse: {
        type: Object,
        required: true
    },
    destination_warehouse: {
        type: Object,
        required: true
    }
});
const state = reactive({
    selected_article: {},
    origin_inventory: [],
    destination_inventory: useOperationStore()?.inventory,
    lastScannedBarCode: "",
    loading: false,
    error: {
        message: "",
        show: false,
    }
});

onMounted(() => {
    state.loading = true;
    useOperationStore().get_warehouse_inventory(props.origin_warehouse).then((inventory) => {
        useOperationStore().origin_inventory = inventory;
        state.origin_inventory = inventory;
        if (!inventory.length > 0) {
            state.error.message = "L'inventaire de l'entrepôt d'origine est vide";
            state.error.show = true;
        }
    }).catch((error) => {
        state.error.message = "Une erreur est survenue";
        state.error.show = true;
    }).then(() => {
        state.loading = false;
    })
});

function VerifyInventory(article_id) {
    state.loading = true;
    console.log(state.inventory)

    if (articleAlreadyScanned(article_id)) {
        state.error.show = false;
        state.loading = false;
        IncrementArticleQty(article_id)
    } else {
        const docRef = doc(db, "inventory", article_id);
        getDoc(docRef).then((doc) => {
            state.loading = false;
            if (doc.exists()) {
                state.error.show = false;
                state.inventory.push({ ...doc.data(), id: doc.id, quantity: 1 });
            } else {
                state.error.show = true;
                state.error.message = "Aucun article trouvé avec ce code-barre";
            }
        }).catch((error) => {
            state.error.show = true;
            state.error.message = "Une erreur est survenue";
        })
    }
}

function IncrementArticleQty(article_id) {
    //verify from origin warehouse if we still have enough article pieces
    const origin_warehouse_quantity = _.find(state.origin_inventory, { id: article_id }).quantity;
    // const destination_warehouse_quantity = _.find(state.destination_inventory, { id: article_id }).quantity;
    if (origin_warehouse_quantity > 0) {
        state.destination_inventory.filter(article => article.id == article_id)[0].quantity++;
        state.origin_inventory.filter(article => article.id == article_id)[0].quantity--;
    }
}

function DecrementArticleQty(article_id) {
    //verify from origin warehouse if we still have enough article pieces
    const destination_warehouse_article = _.find(state.destination_inventory, { id: article_id });
    const destination_warehouse_quantity = destination_warehouse_article.quantity;

    if (destination_warehouse_quantity >= 2) {
        state.destination_inventory.filter(article => article.id == article_id)[0].quantity--;
        state.origin_inventory.filter(article => article.id == article_id)[0].quantity++;
    }

}

function UpdateArticleQuantity(article_id, quantity_to_transfer) {
    // substract the old quantity from the quantity of the origin warehouse
    state.origin_inventory.filter(article => article.id == article_id)[0].quantity -= quantity_to_transfer
    // add the new quantity to the quantity of the destination warehouse
    state.destination_inventory.push({ ...state.origin_inventory.filter(article => article.id == article_id)[0], quantity: quantity_to_transfer })
}

function removeFromArticlesList(article_to_remove) {
    const index_article = state.destination_inventory.indexOf(article_to_remove)
    state.destination_inventory.splice(index_article, 1)
    state.origin_inventory.filter(article => article.id == article_to_remove.id)[0].quantity += article_to_remove.quantity
}

function validateStep() {
    emit('step_validated', props.assigned_step_number, state.destination_inventory)
}

function resetStep() {
    state.destination_inventory = [];
    state.error.show = false;
    state.error.message = "";
}
</script>


<template>
    <AdjustArticleQuantity :key="state.selected_article?.id" modal_id="inventory_modal"
        :article="state.selected_article" @article_selected="UpdateArticleQuantity" />
    <div class="p-3 md:p-6 h-3/6 md:h-4/6">
        <div class="flex h-full w-full">
            <div class="grid h-full flex-grow card bg-base-300 rounded-box place-items-center">
                <template v-if="state.loading">
                    <div role="status">
                        <svg aria-hidden="true"
                            class="mr-2 w-36 h-36 text-gray-200 animate-spin dark:text-gray-600 fill-green-700"
                            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor" />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill" />
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div>
                </template>
                <template v-else-if="state.error.show">
                    <h2 class="text-2xl md:text-3xl font-semibold text-red-800">{{ state.error.message }} ({{
                            props.origin_warehouse?.name
                    }})
                    </h2>
                    <div>
                        <p class="text-xl md:text-2xl font-semibold text-black">
                            <a class="link" @click="$router.push({ name: 'adjust-stock' })">Faire l'inventaire</a>
                            ou
                            <a class="link" @click="$router.push({ name: 'operations' })">Annuler Operation</a>
                        </p>

                        &nbsp;

                    </div>

                </template>
                <template v-else>
                    <div class="flex flex-col h-full w-full lg:flex-row">
                        <div class="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
                            <table class="table table-zebra h-auto w-5/6 mt-3 mx-auto">
                                <!-- head -->
                                <thead>
                                    <tr>
                                        <td colspan="3" class="text-center text-xl">
                                            {{ props.origin_warehouse.name }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-left">Nom Article</th>
                                        <th class="text-center">Qté</th>
                                        <th class="text-right ">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="article in state.origin_inventory">
                                        <td class="text-left">{{ article?.name }}</td>
                                        <td class="text-center">
                                            <div class="btn-group btn-group-horizontal">
                                                <label class="btn bg-black text-dark">{{ article?.quantity }}</label>
                                            </div>
                                        </td>
                                        <td class="text-right">
                                            <label for="inventory_modal" @click="state.selected_article = article"
                                                class="btn">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                                </svg>
                                            </label>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="divider lg:divider-horizontal"></div>
                        <div class="grid flex-grow h-32 card bg-base-300 rounded-box place-items-center">
                            <table class="table table-zebra h-auto w-5/6 mt-3 mx-auto">
                                <!-- head -->
                                <thead>
                                    <tr>
                                        <td colspan="3" class="text-center text-xl">
                                            {{ props.destination_warehouse.name }}
                                        </td>

                                    </tr>
                                    <tr>
                                        <td colspan="3" class="text-center">
                                            <template v-if="state.loading">
                                                <svg aria-hidden="true"
                                                    class="w-12 h-12 text-gray-200 animate-spin dark:text-gray-400 fill-green-700"
                                                    viewBox="0 0 100 101" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                        fill="currentColor" />
                                                    <path
                                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                        fill="currentFill" />
                                                </svg>
                                            </template>
                                            <template v-else>
                                                <div class="flex">

                                                    <div v-if="state.destination_inventory.length"
                                                        class="w-full flex text-center">
                                                        <button @click="validateStep" class="btn w-full btn-primary">
                                                            Valider Transfer
                                                        </button>
                                                    </div>
                                                </div>
                                            </template>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="w-1/2 text-center">Nom Article</th>
                                        <th class="w-1/2 text-center">Qté</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="article in state.destination_inventory">
                                        <td class="text-center">{{ article?.name }}</td>
                                        <td class="text-center">
                                            <div class="btn-group btn-group-horizontal">
                                                <button @click="DecrementArticleQty(article.id)"
                                                    class="btn btn-active">-</button>
                                                <button class="btn">{{ article?.quantity }}</button>
                                                <button @click="IncrementArticleQty(article.id)"
                                                    class="btn btn-active">+</button>
                                            </div>
                                        </td>
                                        <td>
                                            <svg @click="removeFromArticlesList(article)" class="link w-6 h-6"
                                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>