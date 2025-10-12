export default function Revoke() {
  /*
  /revoke nickName
  Odstráni používateľa zo súkromného kanála
  Pravidlá:
  - iba správca môže vykonať /revoke
  - nesie sa s /invite (opačná akcia)
  Korelácia:
  - v verejnom kanáli sa místo toho používa /kick
  */
  return {
    cmd: 'revoke',
    execute: () => {},
  };
}
