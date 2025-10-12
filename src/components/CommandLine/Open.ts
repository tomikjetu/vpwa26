export default function logout() {
  // inject currentOpenChannel ref from parent component
  return {
    cmd: 'open',
    execute: (args: string[]) => {},
  };
}
