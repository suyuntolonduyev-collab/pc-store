import * as migration_20260322_233106_initial from './20260322_233106_initial';
import * as migration_20260325_092242_add_tabels from './20260325_092242_add_tabels';
import * as migration_20260325_100836_recreate_the_3rd_commit from './20260325_100836_recreate_the_3rd_commit';
import * as migration_20260326_132912_fixed from './20260326_132912_fixed';

export const migrations = [
  {
    up: migration_20260322_233106_initial.up,
    down: migration_20260322_233106_initial.down,
    name: '20260322_233106_initial',
  },
  {
    up: migration_20260325_092242_add_tabels.up,
    down: migration_20260325_092242_add_tabels.down,
    name: '20260325_092242_add_tabels',
  },
  {
    up: migration_20260325_100836_recreate_the_3rd_commit.up,
    down: migration_20260325_100836_recreate_the_3rd_commit.down,
    name: '20260325_100836_recreate_the_3rd_commit',
  },
  {
    up: migration_20260326_132912_fixed.up,
    down: migration_20260326_132912_fixed.down,
    name: '20260326_132912_fixed'
  },
];
