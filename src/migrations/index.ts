import * as migration_20260322_233106_initial from './20260322_233106_initial';
import * as migration_20260325_092242_add_tabels from './20260325_092242_add_tabels';
import * as migration_20260325_100836_recreate_the_3rd_commit from './20260325_100836_recreate_the_3rd_commit';
import * as migration_20260326_132912_fixed from './20260326_132912_fixed';
import * as migration_20260406_103024_added_new_poles_ofr_the from './20260406_103024_added_new_poles_ofr_the';
import * as migration_20260407_055052_added_all_globals from './20260407_055052_added_all_globals';
import * as migration_20260414_175247_Upgrt_instruction_code_section from './20260414_175247_Upgrt_instruction_code_section';
import * as migration_20260415_095429_added_fps_counter from './20260415_095429_added_fps_counter';

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
    name: '20260326_132912_fixed',
  },
  {
    up: migration_20260406_103024_added_new_poles_ofr_the.up,
    down: migration_20260406_103024_added_new_poles_ofr_the.down,
    name: '20260406_103024_added_new_poles_ofr_the',
  },
  {
    up: migration_20260407_055052_added_all_globals.up,
    down: migration_20260407_055052_added_all_globals.down,
    name: '20260407_055052_added_all_globals',
  },
  {
    up: migration_20260414_175247_Upgrt_instruction_code_section.up,
    down: migration_20260414_175247_Upgrt_instruction_code_section.down,
    name: '20260414_175247_Upgrt_instruction_code_section',
  },
  {
    up: migration_20260415_095429_added_fps_counter.up,
    down: migration_20260415_095429_added_fps_counter.down,
    name: '20260415_095429_added_fps_counter'
  },
];
