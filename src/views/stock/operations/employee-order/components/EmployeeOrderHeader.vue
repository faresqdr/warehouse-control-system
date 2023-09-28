<script setup>

const props = defineProps({
    step_number: {
        type: Number,
        required: true
    }
});
</script>

<template>
    <div class="hero bg-base-200 p-auto h-3/6 md:h-2/6">
        <div class="hero-content text-center">
            <div class="max-w-md">
                <h1 class="text-3xl font-bold">COMMANDE TECHNICIEN</h1>
                <p class="py-6">Suivez les étapes afin de transferer vos articles à un technicien</p>
                <div class="text-center pt-4">
                    <ul class="steps gap-4">
                        <li :class="step_number == 1 ? 'step-primary' : ''" class="step">Entrepôt de Départ</li>
                        <li :class="step_number == 2 ? 'step-primary' : ''" class="step">Technicien</li>
                        <li :class="step_number == 3 ? 'step-primary' : ''" class="step">Articles</li>
                        <li :class="step_number == 4 ? 'step-primary' : ''" class="step">Récapitulatif</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>