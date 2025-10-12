export default function Invite() {
  /*
  /invite nickName
  Pozve používateľa do kanála
  Pravidlá:
  - do súkromného len správca môže
  - do verejného pozýva ktorýkoľvek člen
  Korelácia:
  - páruje sa s /revoke a /kick
  */
  return {
    cmd: 'invite',
    execute: () => {},
  };
}
