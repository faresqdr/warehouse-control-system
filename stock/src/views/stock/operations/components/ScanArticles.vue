<script setup>
import { onMounted, reactive } from 'vue';
import { db } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";
import AddArticlesModal from '../components/AddArticlesModal.vue';
import { useOperationStore } from '@/store/operation';
import * as _ from 'lodash';

const emit = defineEmits(['previous_step', 'step_validated']);
const state = reactive({
    inventory: useOperationStore().inventory,
    lastScannedBarCode: "",
    loading: false,
    first_scan_is_valid: false,
    error: {
        message: "",
        show: false,
    }
});

function listen_scanner(status) {
    if (status) {
        document.onkeypress = onGlobalKeyPressed;
    } else {
        document.onkeypress = null;
    }
}

function onGlobalKeyPressed(e) {
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;

    if (charCode != 13) { // ascii 13 is return key
        state.lastScannedBarCode += String.fromCharCode(charCode);
    } else { // barcode reader indicate code finished with "enter"
        VerifyInventory(state.lastScannedBarCode)
        state.lastScannedBarCode = ""; // zero out last code (so we do not keep adding)
    }
}

onMounted(async () => {
    listen_scanner(true);
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
                state.first_scan_is_valid = true;
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

function articleAlreadyScanned(article_id) {
    return state.inventory.filter(article => article.id == article_id).length > 0;
}

function IncrementArticleQty(article_id) {
    state.inventory.filter(article => article.id == article_id)[0].quantity++;
}

function DecrementArticleQty(article_id) {
    if (state.inventory.filter(article => article.id == article_id)[0].quantity > 1)
        state.inventory.filter(article => article.id == article_id)[0].quantity--;
    else
        state.inventory = state.inventory.filter(article => article.id != article_id);
}

function addToArticlesList(article) {
    VerifyInventory(article.id)
}

function removeFromArticlesList(article_to_remove) {
    const index_article = state.inventory.indexOf(article_to_remove)
    state.inventory.splice(index_article, 1)
}

function validateStep() {
    emit('step_validated', 2, state.inventory)
}

function resume() {
    state.first_scan_is_valid = true
}

function resetStep() {
    state.inventory = [];
    state.error.show = false;
    state.error.message = "";
}
</script>


<template>
    <AddArticlesModal modal_id="inventory_modal" @article_selected="addToArticlesList" />
    <div class="p-3 md:p-6 h-3/6 md:h-4/6">
        <div class="flex h-full w-full">
            <div class="grid h-full flex-grow card bg-base-300 rounded-box place-items-center">
                <template v-if="state.error.show">
                    <h1 class="text-2xl md:text-3xl font-semibold text-red-800">{{ state.error.message }}</h1>
                </template>
                <template v-if="state.first_scan_is_valid || state.inventory.length > 0">
                    <div class="overflow-auto text-center h-full w-full">
                        <table class="table table-zebra h-auto w-5/6 mt-3 mx-auto">
                            <!-- head -->
                            <thead>
                                <tr>
                                    <td colspan="3" class="text-center">

                                        <template v-if="state.loading">
                                            <svg aria-hidden="true"
                                                class="w-12 h-12 text-gray-200 animate-spin dark:text-gray-400 fill-green-700"
                                                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                                <div class="w-1/3 text-left">
                                                    <button @click="emit('previous_step')" class="btn btn-circle mr-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                            class="w-6 h-6">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                                        </svg>
                                                    </button>
                                                    <button v-if="state.inventory.length" @click="resetStep"
                                                        class="btn btn-circle btn-error">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div class="w-1/3 text-center">
                                                    <p class="animate-pulse font-medium">Scanner Article</p>
                                                    <p>ou</p>
                                                    <label for="inventory_modal"
                                                        class="link text-green-800 font-medium">+
                                                        Ajout
                                                        Manuel</label>
                                                </div>
                                                <div class="w-1/3 text-right">
                                                    <button v-if="state.inventory.length" @click="validateStep"
                                                        class="btn btn-circle btn-primary">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                            class="w-6 h-6">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>


                                        </template>


                                    </td>

                                </tr>
                                <tr>
                                    <th class="w-1/2 text-center">Nom Article</th>
                                    <th class="w-1/2 text-center">Qté</th>
                                    <th class="w-1/2 text-center"></th>
                                </tr>
                            </thead>
                            <tbody>

                                <!-- row 1 -->
                                <tr v-for="article in state.inventory">
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
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path fill-rule="evenodd"
                                                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
                <template v-else>
                    <h1 class="text-2xl md:text-3xl font-semibold animate-pulse">Veuillez scanner un article</h1>
                    <img src="@/assets/barcode.gif" alt="scan" class="w-3/6 md:w-1/6" />
                </template>
            </div>
        </div>
    </div>
</template>