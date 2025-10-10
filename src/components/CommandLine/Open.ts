export default function logout() {
  return {
    cmd: 'open',
    execute: (args: string[]) => {
      console.log('Opening', args);
    },
  };
}
