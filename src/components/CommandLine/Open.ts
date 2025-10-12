export default function Open() {
  // inject currentOpenChannel ref from parent component
  return {
    cmd: 'open',
    execute: (args: string[]) => {},
  };
}
