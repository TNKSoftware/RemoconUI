<template>
  <v-container>
    <v-row>
      <label class="v-label theme--light">{{label}}</label>
    </v-row>
    <v-row>
      <slot></slot>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props:{
    label:{
      type: String
    }
  }
}
</script>

<style>

</style>