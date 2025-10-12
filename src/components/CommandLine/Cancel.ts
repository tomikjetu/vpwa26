export default function Cancel() {
  /*
  /cancel
  Zruší prebiehajúci príkaz alebo akciu
  Korelácia:
  - môže sa použiť na zrušenie /join
  - neusmerňuje práva alebo členstvo
  */
  return {
    cmd: 'cancel',
    execute: () => {},
  };
}
