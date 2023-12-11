<script setup lang="ts">
import { ref } from 'vue'
import { DataRoot, type Config, Weapon } from './models'
import * as cfg from '@/assets/config.json'

const config = cfg as unknown as Config
const dataKey = "savedata"

var selectedGame = ref(config.games[0])
var selectedMode = ref(selectedGame.value.supportedModes[0])
var data = ref<DataRoot>()

function replacer(key: string, value: any) {
  if(value instanceof Map) {
    return { 
      dataType: 'Map',
      value: [...value]
    }
  }

  return value
}

function reviver(key: string, value: any) {
  if(typeof value === 'object' && value !== null) {
    if(value.dataType === 'Map') {
      return new Map(value.value)
    }
  }

  return value
}

function loadData() {
  const raw = localStorage.getItem(dataKey)

  if(raw == null) {
    data.value = new DataRoot(config)
    saveData()
    return
  }

  data.value = JSON.parse(raw, reviver) as DataRoot

  if(data.value.version < config.version) {
    for(const game of config.games) {
      if(data.value.progress.has(game.game)) {
        for(const weaponType of game.weaponTypes) {
          if(data.value.progress.get(game.game)?.has(weaponType.type)) {
            for(const weapon of weaponType.weapons) {
              if(data.value.progress.get(game.game)?.get(weaponType.type)?.find(w => w.name == weapon) == null) {
                data.value.progress.get(game.game)?.get(weaponType.type)?.push(new Weapon(weapon, game.supportedModes))
              }
            }
          } else {
            data.value.progress.get(game.game)?.set(weaponType.type, weaponType.weapons.map(w => new Weapon(w, game.supportedModes)))
          }
        }
      } else {
        data.value.progress.set(game.game, new Map<string, Weapon[]>(
          game.weaponTypes.map(wt => [
            wt.type,
            wt.weapons.map(w => new Weapon(w, game.supportedModes))
          ])
        ))
      }
    }

    data.value.version = config.version
    saveData()
  }
}

function saveData() {
  localStorage.setItem(dataKey, JSON.stringify(data.value, replacer))
}

function selectedGameChanged() {
  selectedMode.value = selectedGame.value.supportedModes[0]
}

function getDataForSelectedGame(): Map<string, Weapon[]> {
  return data.value!.progress.get(selectedGame.value.game)!
}

function getCamosForSelectedMode(): string[] {
  return selectedGame.value.supportedModes.find(g => g.name == selectedMode.value.name)?.camos!
}

function onCamoCheckboxChange(weaponType: string, weaponName: string, camoType: string, value: boolean) {
  const weapon = getDataForSelectedGame().get(weaponType)?.find(w => w.name === weaponName)
  const progress = weapon?.progress.get(selectedMode.value.name)
  progress?.set(camoType, value)
  saveData()
}

function getCamoTotalCompletionCount(camoType: string): string {
  const weapons = [...getDataForSelectedGame().values()].flatMap(w => w)
  const total = weapons.length
  const completed = weapons.filter(w => w.progress.get(selectedMode.value.name)?.get(camoType)).length

  return `${completed}/${total}`
}

function getCamoCompletionCount(weaponType: string, camoType: string): string {
  const weapons = getDataForSelectedGame().get(weaponType)!
  const total = weapons.length
  const completed = weapons.filter(w => w.progress.get(selectedMode.value.name)?.get(camoType)).length

  return `${completed}/${total}`
}

function getTotalMaxLevelCount(): string {
  const weapons = [...getDataForSelectedGame().values()].flatMap(w => w)
  const total = weapons.length
  const completed = weapons.filter(w => w.maxLvl).length

  return `${completed}/${total}`
}

function getMaxLevelCount(weaponType: string): string {
  const weapons = getDataForSelectedGame().get(weaponType)!
  const total = weapons.length
  const completed = weapons.filter(w => w.maxLvl).length

  return `${completed}/${total}`
}

function getWeaponTypeCompleted(weaponType: string): boolean {
  const type = getDataForSelectedGame().get(weaponType)!
  const completed = type.map(w => getWeaponCompleted(weaponType, w.name)).every(b => b)
  return completed
}

function getWeaponCompleted(weaponType: string, weaponName: string): boolean {
  const weapon = getDataForSelectedGame().get(weaponType)?.find(w => w.name == weaponName)!
  const completed = [...weapon.progress.get(selectedMode.value.name)?.values()!].every(b => b) && weapon.maxLvl
  return completed
}

loadData()
</script>

<template>
  <div>
    <select v-model="selectedGame" @change="selectedGameChanged()">
      <option v-for="game in config.games" :value="game">{{ game.game }}</option>
    </select>
    <select v-model="selectedMode" v-if="selectedGame.supportedModes.length > 1">
      <option v-for="mode in selectedGame.supportedModes" :value="mode">{{ mode.name }}</option>
    </select>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Max Lvl ({{ getTotalMaxLevelCount() }})</th>
          <th v-for="camoType in getCamosForSelectedMode()" :key="camoType">{{ camoType }} ({{ getCamoTotalCompletionCount(camoType) }})</th>
        </tr>
      </thead>
      <template v-for="weaponType in getDataForSelectedGame()" :key="weaponType[0]">
        <thead :class="getWeaponTypeCompleted(weaponType[0]) ? 'completed' : ''">
          <tr>
            <th>{{ weaponType[0] }}</th>
            <th>Max Lvl ({{ getMaxLevelCount(weaponType[0]) }})</th>
            <th v-for="camoType in getCamosForSelectedMode()" :key="camoType">{{ camoType }} ({{ getCamoCompletionCount(weaponType[0], camoType) }})</th>
          </tr>
        </thead>
        <tbody>
          <tr :class="getWeaponCompleted(weaponType[0], weapon.name) ? 'completed' : ''" v-for="weapon in weaponType[1]" :key="weapon.name">
            <td>{{ weapon.name }}</td>
            <td class="check-cell" :class="weapon.maxLvl ? 'completed' : ''">
              <input type="checkbox" v-model="weapon.maxLvl" @change="saveData">
              <span>Max Lvl</span>
            </td>
            <td class="check-cell" :class="camoCompletion[1] ? 'completed' : ''" v-for="camoCompletion in weapon.progress.get(selectedMode.name)" :key="camoCompletion[0]">
              <input type="checkbox" v-model="camoCompletion[1]" @change="onCamoCheckboxChange(weaponType[0], weapon.name, camoCompletion[0], camoCompletion[1])">
              <span>{{ camoCompletion[0] }}</span>
            </td>
          </tr>
        </tbody>
      </template>
    </table>
  </div>
</template>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  background-color: black;
}

table {
  width: 100%;
  border: none;
  border-collapse: collapse;

  th, td {
    text-align: left;
    height: 1.4rem;
  }
  
  thead {
    background-color: black;
    color: white;

    &.completed {
      background-color: darkgreen !important;
    }
  }

  tr {
    td:first-child {
      background-color: grey;
    }
  }

  .check-cell {
    background-color: crimson;
  }

  td.completed {
    background-color: green !important;
  }

  tr.completed {
    td {
      background-color: green !important;
    }
  }

  input[type='checkbox'] {
    margin: 0;
    margin-right: 0.5rem;
    padding: 0;
  }
}
</style>
