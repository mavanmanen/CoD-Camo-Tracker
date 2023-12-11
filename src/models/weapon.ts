import { type ConfigSupportedMode } from '.'

export class Weapon {
  public name: string
  public maxLvl: boolean
  public progress: Map<string, Map<string, boolean>>

  constructor(name: string, supportedModes: ConfigSupportedMode[]) {
    this.name = name
    this.maxLvl = false

    this.progress = new Map<string, Map<string, boolean>>(supportedModes.map(sm => [
      sm.name,
      new Map<string, boolean>(
        sm.camos.map(ct => [ct, false])
      )
    ]))
  }
}