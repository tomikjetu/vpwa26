import { useChannelStore } from 'src/stores/channelStore';
import type { Channel, DropdownItem } from 'src/utils/types.ts';
import { useAuthStore } from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';
import { type Ref } from 'vue';
import { useChatStore } from 'src/stores/chat-store';
import { useDialogStore } from 'src/stores/dialog-store';

export const getMenuOptions = (channel: Channel): DropdownItem[] => {
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);

  return [
    {
      label: 'Invite',
      class: '',
      disable: channel.ownerId != getCurrentUser.value?.id && !channel.isPublic,
    },
    { label: 'Members', class: '', disable: false },
   // { label: 'Change icon', class: '', disable: false },
    {
      label: channel.ownerId != getCurrentUser.value?.id ? 'Leave' : 'Remove',
      class: 'warning',
      disable: false,
    },
  ];
};

export function addChannel(newChannel: Channel, channels: Channel[]): void {
  channels.push(newChannel);

  const channelStore = useChannelStore();
  channelStore.addChannel(newChannel);
}

export function removeChannel(channelId: number, channels: Channel[]): void {
  const index = channels.findIndex((channel) => channel.id === channelId);
  if (index !== -1) {
    channels.splice(index, 1);
  }

  const channelStore = useChannelStore();
  channelStore.removeChannel(channelId);
}

export async function leaveChannel(channel: Channel, channels: Channel[]): Promise<void> {
  const dialogStore = useDialogStore();
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);

  const confirmation = await dialogStore.confirmLeaveChannel(
    getCurrentUser.value?.id == channel.ownerId,
  );
  if (!confirmation) return;

  const chatStore = useChatStore();
  chatStore.closeChat();
  removeChannel(channel.id, channels);
}

/** Handles a dropdown option selection */
export async function handleDropdownSelect(
  emit: (event: 'show-members', channel: Channel) => void,
  showInviteDialog: Ref<boolean>,
  channel: Channel,
  channels: Channel[],
  option: DropdownItem,
) {
  const label = option.label.toLowerCase();
  if (label.includes('remove') || label.includes('leave')) {
    await leaveChannel(channel, channels);
  } else if (label.includes('invite')) {
    showInviteDialog.value = true;
  } else if (label.includes('members')) {
    emit('show-members', channel);
  }
}
