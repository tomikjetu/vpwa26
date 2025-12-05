import { useChannelStore } from 'src/stores/channel';
import type { Channel, DropdownItem } from 'src/utils/types';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';
import { type Ref } from 'vue';
import { useChatStore } from 'src/stores/chat';
import { useDialogStore } from 'src/stores/dialog';

export const getMenuOptions = (channel: Channel): DropdownItem[] => {
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);

  return [
    {
      label: 'Invite',
      class: '',
      disable: channel.ownerId != getCurrentUser.value?.id && channel.isPrivate,
    },
    { label: 'Members', class: '', disable: false },
    // { label: 'Change icon', class: '', disable: false },
    {
      label: channel.notifStatus == 'all' ? 'Mentions only notifs' : 'All notifs',
      class: '',
      disable: false,
    },
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

export function removeChannel(channelId: number): void {
  const channelStore = useChannelStore();
  console.log('DROPDOWN');
  channelStore.quitChannelAction(channelId);
}

export function cancelChannel(channelId: number): void {
  const channelStore = useChannelStore();
  channelStore.cancelChannelAction(channelId);
}

export async function leaveChannel(channel: Channel): Promise<void> {
  const dialogStore = useDialogStore();
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);

  const confirmation = await dialogStore.confirmLeaveChannel(
    getCurrentUser.value?.id == channel.ownerId,
  );
  if (!confirmation) return;

  const chatStore = useChatStore();
  chatStore.closeChat();
  cancelChannel(channel.id);
}

export async function quitChannel(channel: Channel): Promise<void> {
  const dialogStore = useDialogStore();
  const authStore = useAuthStore();
  const { getCurrentUser } = storeToRefs(authStore);

  const confirmation = await dialogStore.confirmLeaveChannel(
    getCurrentUser.value?.id == channel.ownerId,
  );
  if (!confirmation) return;

  const chatStore = useChatStore();
  chatStore.closeChat();
  removeChannel(channel.id);
}

/** Handles a dropdown option selection */
export async function handleDropdownSelect(
  emit: (event: 'show-members', channel: Channel) => void,
  showInviteDialog: Ref<boolean>,
  channel: Channel,
  option: DropdownItem,
) {
  const label = option.label.toLowerCase();
  if (label.includes('leave')) {
    await leaveChannel(channel);
  } else if (label.includes('invite')) {
    showInviteDialog.value = true;
  } else if (label.includes('members')) {
    emit('show-members', channel);
  } else if (label.includes('remove')) {
    await quitChannel(channel);
  } else if (label.includes('mentions only notifs')) {
    useChannelStore().updateNotifStatusAction(channel.id, 'mentions');
  } else if (label.includes('all notifs')) {
    useChannelStore().updateNotifStatusAction(channel.id, 'all');
  }
}
