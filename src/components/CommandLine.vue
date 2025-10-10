<template>
    <div v-if="isOpen" class="overlay">
        <div class="cli-wrapper" id="cli">
            <q-input v-model="command" borderless placeholder="Enter command..." autofocus @keyup="filterCommands"
                @keyup.enter="executeCommand" style="width: 600px;" />

            <q-scroll-area style="height: 300px;">
                <q-list id="cli-suggestions">
                    <q-item v-for="cmd in filteredCommands" :key="cmd.id" @focus="focusCommand(cmd.cmd)"
                        @keydown="itemMove" clickable v-ripple @click="command = cmd.cmd; executeCommand()">
                        <q-item-section avatar>
                            <q-avatar rounded>
                                <q-icon :name="cmd.icon" />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ cmd.name }}</q-item-label>
                            <q-item-label caption>{{ cmd.description }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-scroll-area>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue';
import { useChannelStore } from 'src/stores/channelStore';
import { authService } from 'src/services/authService';
import { ref } from 'vue';

const channelStore = useChannelStore();

const isOpen = ref(false);
const command = ref('');

const channelToggleCommands = computed(() => {
    return channelStore.channels.map(channel => ({
        id: "channel-" + channel.id,
        name: `switch to ${channel.name}`,
        cmd: 'open ' + channel.name,
        description: `Switch to channel ${channel.name}`,
        icon: 'chat'
    }));
})

const commands = [
    { id: "1", name: 'logout', cmd: 'logout', description: 'Log out of the application', icon: 'logout' },
    ...channelToggleCommands.value
]

const filteredCommands = ref([...commands]);

function filterCommands(e: KeyboardEvent) {
    if (!command.value) {
        filteredCommands.value = [...commands];
    } else {
        filteredCommands.value = commands.filter(c =>
            c.cmd.toLowerCase().includes(command.value.toLowerCase())
        );
    }
    if (e.key === 'Escape') isOpen.value = false;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.preventDefault();
    if (e.key === 'ArrowDown') {
        const list = document.querySelector('.q-list');
        if (!list) return;
        const firstItem = list.querySelector('.q-item');
        if (firstItem) (firstItem as HTMLElement).focus();
    }
}

function focusCommand(cmd: string) {
    command.value = cmd;
}

function itemMove(e: KeyboardEvent) {
    const list = document.querySelector('#cli-suggestions');
    if (!list) return;
    e.preventDefault();
    const items = list.querySelectorAll('.q-item');
    if (items.length === 0) return;

    const focusedElement = document.activeElement;
    let currentIndex = Array.from(items).indexOf(focusedElement as Element);
    console.log("CUR:", currentIndex);

    if (e.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % items.length;
        console.log(currentIndex, items[currentIndex]);
        (items[currentIndex] as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        (items[currentIndex] as HTMLElement).focus();
    } else if (e.key === 'Tab' || e.key === "Backspace") {
        e.preventDefault();
        (document.querySelector('#cli input') as HTMLElement).focus();
    }
}

function executeCommand() {
    // TODO: optimize executor
    if (command.value === 'logout') {
        authService.logout();
        window.location.href = '/auth/login';
        return;
    }
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