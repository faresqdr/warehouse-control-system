<script setup>
import { reactive } from 'vue';
import WarehouseTransferHeader from './components/WarehouseTransferHeader.vue';
import IdentifyWarehouse from '../components/IdentifyWarehouse.vue';
import OperationSummary from '../components/OperationSummary.vue';
import ScanArticlesFromStock from '../components/ScanArticlesFromStock.vue';
import { useOperationStore } from '@/store/operation';
import { useRouter } from 'vue-router'
import * as _ from 'lodash';

const router = useRouter()
const state = reactive({
    step: 1,
    warehouse_from: {},
    warehouse_to: {},
    step_is_valid: false,
    loading: false,
    error: {
        message: "",
        show: false,
    }
});

function switch_step(step_number, data) {
    switch (step_number) {
        case 1:
            setTimeout(() => {
                state.step = 2;
            }, 1000);
            state.warehouse_from = data;
            break;
        case 2:
            setTimeout(() => {
                state.step = 3;
            }, 1000);
            state.warehouse_to = data;
            break;
        case 3:
            state.step = 4
            useOperationStore().inventory = data;
            console.log(useOperationStore().inventory);
            break;
        case 4:
            state.step = 5;
            state.loading = true;
            useOperationStore().transfer_warehouse_inventory(state.warehouse_from, state.warehouse_to).then((response) => {
                state.loading = false;
                state.step_is_valid = true;
                setTimeout(() => {
                    router.push({ name: 'stock' });
                    state.step = 1;
                }, 1250);
            }).catch((error) => {
                console.log(error);
                state.error.message = "Une erreur est survenue";
                state.error.show = true;
            });
            break;
        default:
            break;
    }
}

function switch_previous_step() {
    state.step = state.step - 1;
}
</script>


<template>
    <template v-if="state.step == 1">
        <WarehouseTransferHeader :step_number="1" />
        <IdentifyWarehouse warehouse_transfer_status="départ"
            :validation_text="'Entrepôt de' + state.warehouse_from?.name" :assigned_step_number="1"
            @step_validated="switch_step" />
    </template>
    <template v-else-if="state.step == 2">
        <WarehouseTransferHeader :step_number="2" />
        <IdentifyWarehouse warehouse_transfer_status="destination"
            :validation_text="'Entrepôt de' + state.warehouse_to?.name" :assigned_step_number="2"
            @step_validated="switch_step" />
    </template>
    <template v-else-if="state.step == 3">
        <WarehouseTransferHeader :step_number="3" />
        <ScanArticlesFromStock :assigned_step_number="3" :origin_warehouse="state.warehouse_from"
            :destination_warehouse="state.warehouse_to" @previous_step="switch_previous_step"
            @step_validated="switch_step" />
    </template>
    <template v-else-if="state.step == 4">
        <WarehouseTransferHeader :step_number="4" />
        <OperationSummary :assigned_step_number="4" @previous_step="switch_previous_step"
            @step_validated="switch_step" />
    </template>
    <template v-else>
        <div class="p-3 md:p-6 h-full">
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
                        <h1 class="text-2xl md:text-3xl font-semibold">Opération validée</h1>
                        <img src="https://cdn3.emoji.gg/emojis/3951-vega-check-mark.png" alt="scan"
                            class="w-3/6 md:w-1/6" />
                    </template>
                </div>
            </div>
        </div>
    </template>
</template>