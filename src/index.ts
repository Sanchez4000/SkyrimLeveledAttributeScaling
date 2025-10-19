import { on, once, printConsole } from "skyrimPlatform";
import ModData from "./meta/modData";
import Global from "./utils/global";
import { ModsList } from "./mods/modsList.enum";
import LevelUpStatScaling from "./mods/HEX_AdventurerExperience/features/levelUpStatScaling";
import AdventurerExpirienceAssets from "./mods/HEX_AdventurerExperience/data/adventurerExpirienceAssets";

let context = Global.Context;

once("skyrimLoaded", () => {
  printConsole(`${ModData.PLUGIN_NAME}`);
  printConsole(`Version ${ModData.VERSION}`);
});

on("newGame", () => {
  printConsole("NewGame");
  once("update", () => {
    start();
  });
});

on("loadGame", () => {
  printConsole("LoadGame");
  start();
});

function start(): void {
  context.Reset();

  for (let i = 0; i < ModData.REQUIREMENTS.length; i++) {
    const modName = ModData.REQUIREMENTS[i];
    context.RegisterMod(modName);
  }

  const mod = context.GetMod(ModsList.HEX_AdventurerExperience)!;
  const modAssets = AdventurerExpirienceAssets.All;

  for (let i = 0; i < modAssets.length; i++) {
    const asset = modAssets[i];
    mod.RegisterAsset(asset.hexId, asset.name);
  }

  context.EnableFeature<LevelUpStatScaling>(
    new LevelUpStatScaling()
  );
}
