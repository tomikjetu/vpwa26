<template>
    <div v-if="isOpen" class="overlay">
        <div class="cli-wrapper">
            <q-input v-model="command" borderless placeholder="Enter command..." autofocus @keyup.enter="executeCommand"
                style="width: 600px;" />
            <q-list>
                <q-item v-for="command in filteredCommands" :key="command.name" clickable v-ripple>
                    <q-item-section avatar>
                        <q-avatar rounded>
                            <q-icon :name="command.icon" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ command.name }}</q-item-label>
                        <q-item-label caption>{{ command.description }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue';
import { ref } from 'vue';

const isOpen = ref(false);
const command = ref('');

const commands = [
    { name: 'logout', description: 'Log out of the application', icon: 'logout' }
]

const filteredCommands = computed(() => {
    if (!command.value) {
        return commands;
    }
    return commands.filter(c => c.name.toLowerCase().includes(command.value.toLowerCase()));
});

function executeCommand() {
    // Placeholder for command execution logic
    console.log(`Executing command: ${command.value}`);
    command.value = ''; // Clear the input after execution
}

function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        isOpen.value = !isOpen.value;
    }
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.05);
    align-items: center;
}

.cli-wrapper {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>