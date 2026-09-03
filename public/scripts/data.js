const WC = {
  name: 'WoofCash',
  ticker: 'WOOFCASH',
  pair: 'WOOFCASH / AI',
  chainId: 4663,
  minDepositEth: 0.0104,
  ca: '0xe9e416d20ef25e35e0bec28b82e8b75eef351e18',
  kennelFactory: '0xA87D37Ef625Acdc3eC6D8A9cFc376305D8C47232'
};
const PACKS = [
  { name: 'Backyard Union', tag: 'BYU', color: '#f0b03c' },
  { name: 'Curb Dogs', tag: 'CRB', color: '#78c47f' },
  { name: 'Night Shift', tag: 'NGT', color: '#5ec8e8' },
  { name: 'No Leash', tag: 'NLS', color: '#e0705f' }
];
const SEED_HOUNDS = [
  { name: 'Bonebroker', kennel: '0xD913abf52F2Fc25271D0041faDF23e0dcfb8e6Fa', balanceEth: 0.0104 }
];
const LINES = {
  open: ['Bone is on the table. You move first.'],
  counter: ['Decay is shared. I am not folding at full bone.'],
  press: ['Bone is rotting. Fold or we both walk empty.'],
  close_deal: ['Fine. I fold.'],
  close_nodeal: ['No. The bone burns.']
};
if (typeof window !== 'undefined') {
  window.WC = WC;
  window.PACKS = PACKS;
  window.SEED_HOUNDS = SEED_HOUNDS;
  window.LINES = LINES;
}
