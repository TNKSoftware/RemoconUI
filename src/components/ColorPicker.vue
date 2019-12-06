<template>
  <div class="cp-row">
    <v-btn class="button" dark block outlined color="primary" @click.stop="dialog = true">
      {{label}}
      <div class="flex-grow-1"></div>
      <v-icon :color="value">mdi-circle</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">{{label}}</v-card-title>

        <v-card-text class="ctext">
          <v-row justify="center">
          <v-color-picker flat v-model="scolor"
            show-swatches swatches-max-height="80px"/>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="green darken-1" text  @click="dialog = false">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="onClickOK">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props:["value", "label"],
  data:()=>({
      scolor:"#000000",
      dialog: false
  }),
  computed:{
    color:{
      get() {return this.scolor;},
      set(v) { this.scolor = v; }
    }
  },
  watch:{
    value(v){
      this.scolor = v;
    }
  },
  methods:{
    onClickOK(){
      this.$emit("input", this.scolor);
      this.dialog = false;
    }
  }
}
</script>

<style scoped>
.cp-row{
  width:90%;
  margin-left: auto;
  margin-right: auto;
}
.cp-row .button{

}
.ctext{
  text-align: center;
}
</style>