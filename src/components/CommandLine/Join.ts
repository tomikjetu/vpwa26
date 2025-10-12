export default function Join() {
  /*
  /join channelName [private]
  Pripojí sa do kanála alebo ho vytvorí
  Pravidlá:
  - každý môže vytvoriť kanál cez /join
  - ak verejný kanál neexistuje, vytvorí sa
  - channelName je unikátny
  Korelácia:
  - súkromný vyžaduje pozvánku (/invite)
  */
  return {
    cmd: 'join',
    execute: () => {},
  };
}
