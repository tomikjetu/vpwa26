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
import { ref } from 'vue';

import Logout from './Logout';
import Open from './Open';
import Cancel from './Cancel';
import Invite from './Invite';
import Revoke from './Revoke';
import Quit from './Quit';
import Join from './Join';
import Kick from './Kick';
import { useAuthStore } from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';

const channelStore = useChannelStore();
const authStore = useAuthStore();
const { getCurrentUser } = storeToRefs(authStore);

const isOpen = ref(false);
const command = ref('');

const channelToggleCommands = computed(() => {
    return channelStore.channels.map(channel => ({
        id: "channel-" + channel.id,
        name: `${channel.name}`,
        cmd: 'open ' + channel.name,
        description: `Switch to channel ${channel.name}`,
        icon: 'chat'
    }));
})

const channelLeaveCommands = computed(() => {
    return channelStore.channels.map(channel => {
        const quit = getCurrentUser.value?.id === channel.ownerId;
        return {
            id: "leave-" + channel.id,
            name: `${quit ? 'Quit ' : 'Leave '} ${channel.name}`,
            cmd: 'quit ' + channel.name,
            description: quit ? `Quit channel ${channel.name}` : `Leave channel ${channel.name}`,
            icon: 'cancel'
        };
    });
})

const channelKickCommands = computed(() => {
    const cmdInput = command.value.trim();
    const args = cmdInput.split(' ').slice(1);
    if (args.length == 1) {
        const channel = channelStore.channels.find((ch) => ch.name === args[0]);
        if (channel) {
            const members = Object.values(channel.members);
            if (members.length > 0) {
                return members.map(member => {
                    return {
                        id: "kick-" + channel.id + "-" + member.id,
                        name: `Kick ${member.nickname} from ${channel.name}`,
                        cmd: 'kick ' + channel.name + ' ' + member.nickname,
                        description: `Kick member ${member.nickname} from channel ${channel.name}`,
                        icon: 'block'
                    };
                });
            }
        }
    }

    return channelStore.channels.map(channel => {
        return {
            id: "kick-" + channel.id,
            name: `Kick from ${channel.name}`,
            cmd: 'kick ' + channel.name,
            description: `Kick a member from channel ${channel.name}`,
            icon: 'block'
        };
    })
})

const commands = computed(() => [
    { id: "1", name: 'Log Out', cmd: 'logout', description: 'Log out of the application', icon: 'logout' },
    { id: "2", name: "Join", cmd: "join", description: "Join a channel", icon: "login" },
    { id: "3", name: "Invite", cmd: "invite", description: "Invite a user to a channel", icon: "person_add" },
    { id: "4", name: "Revoke", cmd: "revoke", description: "Revoke a user's access to a channel", icon: "person_remove" },
    { id: "5", name: "Cancel", cmd: "cancel", description: "Cancel the current operation", icon: "close" },
    ...channelToggleCommands.value,
    ...channelLeaveCommands.value,
    ...channelKickCommands.value
])

const filteredCommands = ref([...commands.value]);

function filterCommands(e: KeyboardEvent) {
    if (!command.value) {
        filteredCommands.value = [...commands.value];
    } else {
        filteredCommands.value = commands.value.filter(c =>
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

    if (e.key === 'ArrowDown') {
        currentIndex = (currentIndex + 1) % items.length;
        (items[currentIndex] as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        (items[currentIndex] as HTMLElement).focus();
    } else if (e.key === 'Tab' || e.key === "Backspace") {
        e.preventDefault();
        (document.querySelector('#cli input') as HTMLElement).focus();
    }
}

const executors = [
    Cancel(),
    Invite(),
    Join(),
    Kick(),
    Logout(),
    Open(),
    Quit(),
    Revoke()
]

async function executeCommand() {
    const cmdInput = command.value.trim();
    const cmd = cmdInput.split(' ')[0];
    const args = cmdInput.split(' ').slice(1);
    command.value = '';
    isOpen.value = false;
    const executor = executors.find(ex => ex.cmd === cmd);
    if (executor) await executor.execute(args);
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

.body--dark .cli-wrapper {
    background: #1e1e1e;
    color: white;
}
</style>