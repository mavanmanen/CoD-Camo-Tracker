export interface Config {
  version: number
  games: ConfigGame[]
}

export interface ConfigGame {
  name: string
  supportedModes: ConfigSupportedMode[]
  weaponTypes: ConfigWeaponType[]
}

export interface ConfigSupportedMode {
  name: string
  camos: CamoConfig[]
}

export interface CamoConfig {
  name: string
  colour: string
}

export interface ConfigWeaponType {
  type: string
  weapons: string[]
}