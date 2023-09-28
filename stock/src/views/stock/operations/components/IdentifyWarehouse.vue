<script setup>
import { onMounted, reactive } from 'vue';
import { db } from '@/firebase';
import { doc, getDoc } from "firebase/firestore";

const emit = defineEmits(['step_validated']);
const props = defineProps({
    warehouse_transfer_status: {
        type: Object,
        required: false,
    },
    assigned_step_number: {
        type: Number,
        required: true,
    }
});
const state = reactive({
    warehouse: null,
    lastScannedBarCode: "",
    loading: false,
    step_is_valid: false,
    error: {
        message: "",
        show: false,
    }
});

onMounted(async () => {
    listen_scanner(true);
});

function listen_scanner(status) {
    if (status) {
        document.onkeypress = onGlobalKeyPressed;
    } else {
        document.onkeypress = null;
    }
}

function VerifyWarehouse(barcode) {
    state.loading = true;
    const docRef = doc(db, "warehouses", barcode);

    getDoc(docRef).then((doc) => {
        state.loading = false;
        if (doc.exists()) {
            listen_scanner(false);
            state.warehouse = { ...doc.data(), id: doc.id };
            state.step_is_valid = true;
            emit('step_validated', props.assigned_step_number, state.warehouse);
        } else {
            state.error.show = true;
            state.error.message = "Aucun Entrepôt trouvé avec ce code-barre";
            listen_scanner(true);
        }
    }).catch((error) => {
        state.error.show = true;
        state.error.message = "Une erreur est survenue";
    })
}

function onGlobalKeyPressed(e) {
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;

    if (charCode != 13) { // ascii 13 is return key
        state.lastScannedBarCode += String.fromCharCode(charCode);
    } else { // barcode reader indicate code finished with "enter"
        listen_scanner(false)
        VerifyWarehouse(state.lastScannedBarCode)
        state.lastScannedBarCode = ""; // zero out last code (so we do not keep adding)
    }
}
</script>


<template>
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
                <template v-else-if="state.step_is_valid">
                    <h1 class="text-2xl md:text-3xl font-semibold">Entrepôt : {{ state.warehouse?.name }}</h1>
                    <img src="https://cdn3.emoji.gg/emojis/3951-vega-check-mark.png" alt="scan"
                        class="w-3/6 md:w-1/6" />
                </template>
                <template v-else>
                    <h1 v-if="state.error.show" class="text-2xl md:text-3xl font-semibold text-center text-red-800">
                        {{ state.error?.message }}</h1>
                    <h1 class="text-2xl md:text-3xl font-semibold animate-pulse">Veuillez identifier l'entrepôt {{ props.warehouse_transfer_status ? 'de ' + props.warehouse_transfer_status : ''}}  </h1>
                    <img src="@/assets/barcode.gif" alt="scan" class="w-3/6 md:w-1/6" />

                </template>
            </div>
        </div>
    </div>
</template>