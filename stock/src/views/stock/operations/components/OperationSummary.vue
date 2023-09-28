<script setup>
import { onMounted, reactive } from 'vue';
import { useOperationStore } from '@/store/operation';
import * as _ from 'lodash';

const emit = defineEmits(['previous_step','step_validated']);
const props = defineProps({
    assigned_step_number: {
        type: Number,
        required: true,
    },
});
const state = reactive({
    warehouse: {},
    employee: {},
    inventory: [],
    operation: {},
});

onMounted(() => {
    state.warehouse = useOperationStore().warehouse;
    state.inventory = useOperationStore().inventory;
    console.log(state.inventory);
});

</script>

<template>
    <div class="p-3 md:p-6 h-3/6 md:h-4/6">
        <div class="flex h-full w-full">
            <div class="grid h-full flex-grow card bg-base-300 rounded-box place-items-center">
                <div class="overflow-auto text-center h-full w-full">
                    <table class="table bg-base-300 h-auto mt-3 mx-auto">
                        <thead class="bg-base-300">

                            <tr>
                                <th class="w-1/2 text-left">
                                    <button @click="emit('previous_step')" class="btn btn-wide btn-secondary">Retour</button>
                                </th>
                                <th class="w-1/2 text-right">
                                    <button @click="emit('step_validated', props.assigned_step_number)" class="btn btn-wide btn-primary">Valider</button>
                                </th>
                            </tr>
                            <tr>
                                <th class="w-1/2 text-left">Nom Article</th>
                                <th class="w-1/2 text-right">Qté</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="article in state.inventory">
                                <td class="text-left">{{ article?.name }}</td>
                                <td class="text-right font-semibold">
                                    <span>x{{ article?.quantity }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>