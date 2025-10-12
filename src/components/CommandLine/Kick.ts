export default function Kick() {
  /*
  /kick nickName
  Vyhodí používateľa z kanála
  Pravidlá:
  - vo verejnom môže člen vyhodiť iného
  - ak aspoň 3 členovia vyhodia, ban je trvalý
  - správca môže vyhodiť natrvalo kedykoľvek
  Korelácia:
  - správca môže zrušiť ban cez /invite
  */
  return {
    cmd: 'kick',
    execute: () => {},
  };
}
