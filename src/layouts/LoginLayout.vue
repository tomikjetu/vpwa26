<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
            <q-page class="flex flex-center bg-surface">
                <div class="auth-container">
                    <div class="text-center q-mb-lg">
                        <q-avatar size="80px" class="q-mb-md">
                            <q-icon name="lock" size="40px" color="primary" />
                        </q-avatar>
                        <h4 class="text-weight-bold q-my-md text-grey-8">Welcome</h4>
                        <p class="text-grey-6">Please sign in to continue</p>
                    </div>

                    <q-card class="auth-card" flat bordered>
                        <q-card-section>
                            <router-view />
                        </q-card-section>
                    </q-card>

                    <div class="text-center q-mt-md">
                        <p class="text-grey-6 text-caption">
                            2025 VPWA
                        </p>
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
// No additional logic needed for now
</script>

<style scoped lang="scss">
.auth-container {
    width: 100%;
    max-width: 400px;
    padding: 20px;
}

.auth-card {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 480px) {
    .auth-container {
        padding: 16px;
        max-width: 100%;
    }
}
</style>
