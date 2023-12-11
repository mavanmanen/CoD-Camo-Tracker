export interface Config {
  version: number
  games: ConfigGame[]
}

export interface ConfigGame {
  game: string
  supportedModes: ConfigSupportedMode[]
  weaponTypes: ConfigWeaponType[]
}

export interface ConfigSupportedMode {
  name: string
  camos: string[]
}

export interface ConfigWeaponType {
  type: string
  weapons: string[]
}