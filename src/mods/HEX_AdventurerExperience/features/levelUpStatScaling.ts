import { Game, on, once, Spell } from "skyrimPlatform";
import Global from "../../../utils/global";
import Feature from "../../../core/feature";
import { ModsList } from "../../modsList.enum";
import AdventurerExpirienceAssets from "../data/adventurerExpirienceAssets";
import SpellData from "src/utils/interfaces/spellData.interface";

export default class LevelUpStatScaling extends Feature {
  public readonly Name = "LevelUpStatScaling";

  private readonly _eventHandlerName = "RefreshBonuses";
  private readonly _mod = Global.Context.GetMod(
    ModsList.HEX_AdventurerExperience
  );
  private readonly _spells = [
    AdventurerExpirienceAssets.Spells.HEX_SPELL_AdventurierExpirience0,
    AdventurerExpirienceAssets.Spells.HEX_SPELL_AdventurierExpirience1,
    AdventurerExpirienceAssets.Spells.HEX_SPELL_AdventurierExpirience2,
    AdventurerExpirienceAssets.Spells.HEX_SPELL_AdventurierExpirience3,
  ];

  public Enable(): void {
    Global.Context.SafeSubscribe(
      on("levelIncrease", () => {
        this.EventHandler();
      }),
      this._eventHandlerName
    );
  }
  public Disable(): void {
    Global.Context.Unsubscribe(this._eventHandlerName);
  }

  private EventHandler(): void {
    if (this._mod === null) return;

    const level = Game.getPlayer()?.getLevel()!;
    for (let i = 0; i < this._spells.length; i++) {
      const spell = this._spells[i];

      if (this.HasSpell(spell)) {
        this.RemoveSpell(spell);
        once("update", () => {
          this.AddSpell(spell, level, true);
        });
      }

      this.AddSpell(spell, level);
    }
  }
  private HasSpell(spell: SpellData): boolean {
    const spellForm = this.GetSpell(spell);
    const player = Game.getPlayer()!;
    return player.hasSpell(spellForm);
  }
  private GetSpell(spell: SpellData): Spell | null {
    const asset = this._mod?.GetAsset(spell.name)!;
    const form = Game.getFormEx(asset.NumericId);
    return Spell.from(form)!;
  }
  private AddSpell(
    spell: SpellData,
    power: number,
    silent: boolean = false
  ): void {
    const spellForm = this.GetSpell(spell);
    const player = Game.getPlayer()!;

    const effectsCount = spellForm?.getMagicEffects()?.length!;

    for (let j = 0; j < effectsCount; j++) {
      const data = spell.effectsData.find((effect) => effect.index == j);

      if (data === undefined) continue;

      const magnitude = Math.floor(power / data.divider) * data.value;

      if (data.limit !== undefined && magnitude > data.limit) {
        spellForm?.setNthEffectMagnitude(j, data.limit);
      } else {
        spellForm?.setNthEffectMagnitude(j, magnitude);
      }
    }

    player.addSpell(spellForm, !silent);
  }
  private RemoveSpell(spell: SpellData): void {
    const spellForm = this.GetSpell(spell);
    const player = Game.getPlayer()!;
    player.removeSpell(spellForm);
  }
}
