import { Weapon, type Config } from '.'

export class DataRoot {
  public version: number
  public progress = new Map<string, Map<string, Weapon[]>>()

  constructor(config: Config) {
    this.version = config.version
    
    this.progress = new Map<string, Map<string, Weapon[]>>(
      config.games.map(g => [
        g.name,
        new Map<string, Weapon[]>(
          g.weaponTypes.map(wt => [
            wt.type,
            wt.weapons.map(w => new Weapon(w, g.supportedModes))
          ])
        )
      ])
    )
  }
}