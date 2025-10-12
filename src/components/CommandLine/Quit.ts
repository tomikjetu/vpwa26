export default function Quit() {
  /*
  /quit
  Zatvorí alebo zruší kanál (admin)
  Pravidlá:
  - len správca kanála môže zatvoriť kanál
  Korelácia:
  - po /quit kanál prestane existovať
  */
  return {
    cmd: 'quit',
    execute: () => {},
  };
}
