<script setup lang="ts">
import { useDataStore } from '@/stores/data-store'

const state = useDataStore()
state.loadData()

function formatCompletion(completionCount: { completed: number, total: number }) {
  return `${completionCount.completed}/${completionCount.total}`
}
</script>

<template>
  <div>
    <select v-model="state.selectedGameIndex">
      <option v-for="(game, index) in state.config.games" :value="index">{{ game.name }}</option>
    </select>
    <select v-model="state.selectedModeIndex" :disabled="state.selectedGame.supportedModes.length == 1">
      <option v-for="(mode, index) in state.selectedGame.supportedModes" :value="index">{{ mode.name }}</option>
    </select>
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
      <template v-for="weaponType in state.weaponTypes" :key="weaponType[0]">
        <thead>
          <tr>
            <th>{{ weaponType[0] }} ({{ formatCompletion(state.getWeaponTypeCompletionCount(weaponType[0])) }})</th>
            <th>Max Lvl ({{ formatCompletion(state.getWeaponTypeMaxLevelCount(weaponType[0])) }})</th>
            <th v-for="camoType in state.camos" :key="camoType.name">
              {{ camoType.name }} ({{ formatCompletion(state.getCamoCompletionCount(weaponType[0], camoType.name)) }})</th>
          </tr>
        </thead>
        <tbody>
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
</style>
