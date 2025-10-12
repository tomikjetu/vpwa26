export default function Open() {
  // inject currentOpenChannel ref from parent component
  // take it as parameter to the Open() function from commandline
  // use it there to update the UI for kick, etc.
  return {
    cmd: 'open',
    execute: (args: string[]) => {
      console.log('Open command executed with args:', args);
    },
  };
}
