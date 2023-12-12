import { defineStore } from 'pinia'
import { DataRoot, Weapon } from '@/models'
import * as cfg from '@/assets/config.json'
import { computed, ref, watch } from 'vue'

const dataKey = 'savedata'

export const useDataStore = defineStore('datastore', () => {
  // State
  const config = ref(cfg)
  const selectedGameIndex = ref(0)
  const selectedModeIndex = ref(0)
  const data = ref<DataRoot>()

  // Getters
  const selectedGame = computed(() => config.value.games[selectedGameIndex.value])
  const selectedMode = computed(() => selectedGame.value.supportedModes[selectedModeIndex.value])
  const weaponTypes = computed(() => data.value!.progress.get(selectedGame.value.name)!)
  const camos = computed(() => selectedMode.value.camos)
  const weapons = computed(() => [...weaponTypes.value.values()].flatMap(w => w))

  // Actions
  function loadData() {
    const raw = localStorage.getItem(dataKey)

    if(raw == null) {
      data.value = new DataRoot(config.value)
      return
    }

    data.value = JSON.parse(raw, (key: string, value: any) => {
      if(typeof value === 'object' && value !== null) {
        if(value.dataType === 'Map') {
          return new Map(value.value)
        }
      }
    
      return value
    })

    if(!data.value) {
      return
    }

    if(data.value.version < config.value.version) {
      upgradeData()
    }
  }

  function upgradeData() {
    if(!data.value) {
      return
    }

    for(const game of config.value.games) {
      if(data.value.progress.has(game.name)) {
        for(const weaponType of game.weaponTypes) {
          if(data.value.progress.get(game.name)!.has(weaponType.type)) {
            for(const weapon of weaponType.weapons) {
              if(!data.value.progress.get(game.name)!.get(weaponType.type)!.find(w => w.name == weapon)) {
                data.value.progress.get(game.name)!.get(weaponType.type)!.push(new Weapon(weapon, game.supportedModes))
              }
            }
          } else {
            data.value.progress.get(game.name)!.set(
              weaponType.type,
              weaponType.weapons.map(w => new Weapon(w, game.supportedModes))
            )
          }
        }
      } else {
        data.value.progress.set(game.name, new Map<string, Weapon[]>(
          game.weaponTypes.map(wt => [
            wt.type,
            wt.weapons.map(w => new Weapon(w, game.supportedModes))
          ])
        ))
      }
    }
  }

  function getCamoTotalCompletionCount(camo: string) {
    return {
      total: weapons.value.length,
      completed: weapons.value.filter(w => w.progress.get(selectedMode.value.name)!.get(camo)).length
    }
  }

  function getWeaponsByType(weaponType: string) {
    return weaponTypes.value.get(weaponType)!
  }

  function getCamoCompletionCount(weaponType: string, camo: string) {
    return {
      total: getWeaponsByType(weaponType).length,
      completed: getWeaponsByType(weaponType).filter(w => w.progress.get(selectedMode.value.name)!.get(camo)).length
    }
  }

  function getTotalMaxLevelCount() {
    return {
      total: weapons.value.length,
      completed: weapons.value.filter(w => w.maxLvl).length
    }
  }

  function getWeaponTypeMaxLevelCount(weaponType: string) {
    return {
      total: getWeaponsByType(weaponType).length,
      completed: getWeaponsByType(weaponType).filter(w => w.maxLvl).length
    }
  }

  function getWeapon(weaponType: string, weaponName: string) {
    return weaponTypes.value.get(weaponType)!.find(w => w.name == weaponName)!
  }

  function getWeaponCompleted(weaponType: string, weaponName: string) {
    return weaponCompleted(getWeapon(weaponType, weaponName))
  }

  function weaponCompleted(weapon: Weapon) {
    return weapon.maxLvl && [...weapon.progress.get(selectedMode.value.name)!.values()].every(b => b)
  }

  function toggleCamoCompletion(weaponType: string, weaponName: string, camoType: string) {
    const weapon = getWeapon(weaponType, weaponName)
    const progress = weapon.progress.get(selectedMode.value.name)
    const completed = progress!.get(camoType)!
    progress!.set(camoType, !completed)
  }

  function toggleMaxLevel(weaponType: string, weaponName: string) {
    const weapon = getWeapon(weaponType, weaponName)
    weapon.maxLvl = !weapon.maxLvl
  }

  function getCompletionColour(camoType: string) {
    return camos.value.find(c => c.name == camoType)!.colour
  }

  function getWeaponTypeCompletionCount(weaponType: string) {
    const weapons = weaponTypes.value.get(weaponType)!
    return {
      total: weapons.length,
      completed: weapons.map(w => getWeaponCompleted(weaponType, w.name)).filter(b => b).length
    }
  }

  function getTotalCompleted() {
    const weapons = [...weaponTypes.value.values()!].flatMap(w => w)
    return {
      total: weapons.length,
      completed: weapons.filter(w => weaponCompleted(w)).length
    }
  }

  // Watchers
  watch(selectedGameIndex, () => {
    selectedModeIndex.value = 0
  })

  watch(data, () => {
    localStorage.setItem(dataKey, JSON.stringify(data.value, (key: string, value: any) => {
      if(value instanceof Map) {
        return { 
          dataType: 'Map',
          value: [...value]
        }
      }
    
      return value
    }))
  }, { deep: true })

  return {
    // State
    config,
    selectedGameIndex,
    selectedModeIndex,
    data,

    // Getters
    selectedGame,
    selectedMode,
    weaponTypes,
    camos,

    // Actions
    loadData,
    getCamoTotalCompletionCount,
    getCamoCompletionCount,
    getTotalMaxLevelCount,
    getWeaponTypeMaxLevelCount,
    getWeaponCompleted,
    toggleCamoCompletion,
    toggleMaxLevel,
    getCompletionColour,
    getWeaponTypeCompletionCount,
    getTotalCompleted
  }
})
