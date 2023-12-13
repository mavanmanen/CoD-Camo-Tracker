<script setup lang="ts">
import { useDataStore } from '@/stores/data-store'
import { stringify } from 'querystring';

const state = useDataStore()
state.loadData()

function formatCompletion(completionCount: { completed: number, total: number }) {
  return `${completionCount.completed}/${completionCount.total}`
}

function exportJson() {
  const data = state.getDataAsJson()
  const element = document.createElement('a')
  element.setAttribute('href', `data:application/json;charset=utf-8, ${encodeURIComponent(data)}`)
  element.setAttribute('download', 'cod-camo-tracker-export.json')
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

function importJson(event: any) {
  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = e => {
    state.importJson(e.target!.result as string)
  }

  reader.readAsText(file)
}

</script>

<template>
  <div>
    <div id="toolbar">
      <select v-model="state.selectedGameIndex">
        <option v-for="(game, index) in state.config.games" :value="index">{{ game.name }}</option>
      </select>

      <select v-model="state.selectedModeIndex">
        <option v-for="(mode, index) in state.selectedGame.supportedModes" :value="index">{{ mode.name }}</option>
      </select>

      <button @click="exportJson">Export JSON</button>
      <button onclick="document.getElementById('import-file-input').click()">Import JSON</button>
      <input type="file" accept="application/json" id="import-file-input" @change="importJson" style="display: none;">

      <a href="https://github.com/mavanmanen/cod-camo-tracker/blob/main/patchnotes.md">Patchnotes</a>
      <a href="https://github.com/mavanmanen/cod-camo-tracker">Source Code (GitHub)</a>
    </div>

    <table v-if="state.selectedMode">
      <thead>
        <tr>
          <th>Total completed: ({{ formatCompletion(state.getTotalCompleted()) }})</th>
          <th>Max Lvl ({{ formatCompletion(state.getTotalMaxLevelCount()) }})</th>
          <th v-for="camoType in state.camos" :key="camoType.name">
            {{ camoType.name }} ({{ formatCompletion(state.getCamoTotalCompletionCount(camoType.name)) }})
          </th>
        </tr>
      </thead>
      <template v-for="(weaponType, index) in state.weaponTypes" :key="weaponType[0]">
        <thead @click="state.toggleCategory(index)">
          <tr>
            <th>{{ weaponType[0] }} ({{ formatCompletion(state.getWeaponTypeCompletionCount(weaponType[0])) }})</th>
            <th>Max Lvl ({{ formatCompletion(state.getWeaponTypeMaxLevelCount(weaponType[0])) }})</th>
            <th v-for="camoType in state.camos" :key="camoType.name">
              {{ camoType.name }} ({{ formatCompletion(state.getCamoCompletionCount(weaponType[0], camoType.name)) }})
            </th>
          </tr>
        </thead>
        <tbody :class="state.toggleStates?.get(index) ? 'hidden' : ''">
          <tr :class="state.getWeaponCompleted(weaponType[0], weapon.name) ? 'completed' : ''"
            v-for="weapon in weaponType[1]" :key="weapon.name">
            <td>{{ weapon.name }}</td>
            <td class="check-cell" style="--completion-colour: #027a02;" :class="weapon.maxLvl ? 'completed' : ''"
              @click="state.toggleMaxLevel(weaponType[0], weapon.name)" title="Max Lvl"></td>
            <td class="check-cell" :style="'--completion-colour: ' + state.getCompletionColour(camoCompletion[0]) + ';'"
              :class="camoCompletion[1] ? 'completed' : ''"
              v-for="camoCompletion in weapon.progress.get(state.selectedMode?.name)" :key="camoCompletion[0]"
              @click="state.toggleCamoCompletion(weaponType[0], weapon.name, camoCompletion[0])"
              :title="camoCompletion[0]"></td>
          </tr>
        </tbody>
      </template>
    </table>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');

* {
  box-sizing: border-box;
}

html,
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background-color: black;
  font-size: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    height: 1.4rem;
    border: solid 1px black;
    padding: 5px 10px;
  }

  thead {
    font-size: 1.2rem;
    background-color: black;
    color: white;

    th {
      &:first-child {
        text-align: left;
      }

      text-align: center;
    }
  }

  tr {
    td:first-child {
      background-color: grey;
    }

    &:hover {
      td {
        opacity: 0.8;
      }
    }
  }

  tbody.hidden {
    display: none;
  }

  .check-cell {
    background-color: #EB5160;
  }

  td.completed {
    background-color: var(--completion-colour) !important;
  }

  tr.completed td:first-child {
    background-color: #027a02;
  }
}

a {
  color: white;
}

#toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
