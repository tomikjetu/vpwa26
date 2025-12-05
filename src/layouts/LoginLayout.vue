<template>
    <q-layout view="lHh Lpr lFf">
        <q-page-container>
            <q-page class="flex flex-center bg-page">
                <div class="auth-container">
                    <div class="text-center q-mb-lg">
                        <q-avatar size="80px" class="q-mb-md auth-avatar">
                            <q-icon name="lock" size="40px" color="primary" />
                        </q-avatar>
                        <h4 class="text-weight-bold q-my-md text-color-primary">Welcome</h4>
                        <p class="text-color-muted">Please sign in to continue</p>
                    </div>

                    <q-card class="auth-card" flat>
                        <q-card-section>
                            <router-view />
                        </q-card-section>
                    </q-card>

                    <div class="text-center q-mt-md">
                        <p class="text-caption text-color-muted">
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
    max-width: 420px;
    padding: 24px;
}

.auth-avatar {
    background: var(--bg-tertiary);
}

.auth-card {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    background: var(--bg-surface);
    border: 1px solid var(--border-light);
}

@media (max-width: 480px) {
    .auth-container {
        padding: 16px;
        max-width: 100%;
    }

    .auth-card {
        border-radius: 16px;
    }
}
</style>
