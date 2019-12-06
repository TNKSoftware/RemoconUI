<template>
  <div class="grid-box" :style="gridStyle">
    <v-btn class="grid-item"
     min-width="20px" min-height="20px"
     :text="item.label" :color="item.backColor"
     :style="buttonStyle" :class="{nopointer:noPointerClass}"
     @click="onClicked">
      <v-icon v-if="type==0" :color="color" :size="size">mdi-{{text}}</v-icon>
      <span v-else-if="type!=1" :style="{fontSize:size,color:color}">{{text}}</span>
    </v-btn>
    <v-checkbox @mousedown.stop @touchstart.stop @change="onCheckChanged" v-if="editable" dense class="sel" v-model="item.selected"></v-checkbox>
    <v-icon dark v-if="editable" class="handle">mdi-resize-bottom-right</v-icon>
  </div>
</template>

<script>
export default {
  name:"RemoButton",
  props:{
    editable:{
      type: Boolean,
      default: false
    },
    item:{
      type: Object,
      required: true
    },
    gridSize:{
      type: Number,
      default: 100
    }
  },

  computed:{
    noPointerClass(){
      if(this.item.label == true) return true;
      return this.editable;
    },

    gridPixelSize(){
      var w, h;
      if(this.item.position){
        w = this.item.position.w;
        h = this.item.position.h
      }else{
        w = this.item.w;
        h = this.item.h;
      }
      return Math.min(this.gridSize * w, this.gridSize * h);
    },
    gridStyle(){
      if(this.editable == false){
        return {
          gridColumn: (this.item.x + 1) +" / span " + this.item.w,
          gridRow: (this.item.y + 1) + " / span " + this.item.h
        };
      }
    },
    buttonStyle(){
      var vs = this.item.corner;
      var br = "";
      for(var i = 0; i < 4; i++){
        br += (this.gridPixelSize * vs[i] / 100) + "px ";
      }

      return {
        borderRadius: br, 
        backgroundImage: (this.type == 1) ? "url(\'" + this.text + "\')" : "",
        backgroundSize: (this.type == 1) ? this.item.labelSize+"% auto" : ""
      };
    },
    size(){
      return (this.gridPixelSize * this.item.labelSize / 100) + "px";
    },
    color(){
      return this.item.foreColor;
    },
    text(){
      return this.item.labelText;
    },
    type(){
      if(this.item.labelType == "icon"){
        return 0;
      }else if(this.item.labelType == "image"){
        return 1;
      }else{
        return 2;
      }
    }
  },
  methods:{
    onCheckChanged(v){
      this.$emit("checked", v);
    },

    onClicked(ev){
      this.$emit("click", ev);
    }
  }
}
</script>

<style>
.grid-box{
  width:100%;
  height:100%;
}

.grid-box .grid-item{
  position: relative;
  height:100% !important;
  width:100% !important;
  text-transform: none !important;
  overflow: hidden;
}

.grid-box .grid-item .v-btn__content{
  position: absolute;
}

.gridBorder.dnd-grid-box:not(.dragging){
  border:1px dotted gray;
}

.grid-box .nopointer{
  pointer-events: none;
}

.grid-box .v-btn .container{
  padding:0;
}

.grid-box .sel{
  position: absolute;
  margin-top:0px;
  margin-left:0px;
  top:0px;left:2px;
}

.grid-box .handle{
  position: absolute;
  margin-bottom:0px;
  margin-right:0px;
  bottom:3px;right:3px;
}

.grid-box .grid-item{
  background-repeat: no-repeat;
  background-position: center;
}
</style>