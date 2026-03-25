import * as migration_20260322_233106_initial from './20260322_233106_initial';
import * as migration_20260325_092242_add_tabels from './20260325_092242_add_tabels';

export const migrations = [
  {
    up: migration_20260322_233106_initial.up,
    down: migration_20260322_233106_initial.down,
    name: '20260322_233106_initial',
  },
  {
    up: migration_20260325_092242_add_tabels.up,
    down: migration_20260325_092242_add_tabels.down,
    name: '20260325_092242_add_tabels'
  },
];
