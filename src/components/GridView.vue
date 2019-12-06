<template>
  <div v-resize="onResized" class="grid-view-out">
    <div class="grid-view-in" :style="gridLayoutStyle">
      <remo-button v-for="(item, index) in page.items"
      :key="index" :item="item" :gridSize="gridSize" :editable="false"
      @click="onClickButton(actions[index])"/>
    </div>
  </div>
</template>

<script>
import RemoButton from './RemoButton.vue'

export default {
  components:{
    RemoButton
  },
  props:{
    page:{
      type: Object,
      required: true,
    },
    dictionary:{
      type: Object,
      default: null
    }
  },
  data:()=>({
    areaWidth: 320,
    areaHeight: 480,

    actions:[],
  }),
  mounted(){
    this.updateAction(this.page);
  },
  watch:{
    page(np){
      this.updateAction(np);
    }
  },
  computed:{
    gridLayoutStyle(){
      var mx = 0, my = 0;
      this.page.items.forEach((i)=>{
        mx = Math.max(mx, i.x);
        my = Math.max(my, i.y);
      });
      var ggap = (this.gridSize * (this.page.margin / 100) / 2)+"px";
      return {
          gridGap: ggap,
          gridTemplateColumns: "repeat("+ (mx + 1) +","+this.gridSize+"px)",
          gridTemplateRows: "repeat("+  (my + 1) +","+this.gridSize+"px)",
      };
    },
    gridSize(){
      var cw = (this.areaWidth - 40) / this.page.cols;
      var ch = (this.areaHeight - 40) / this.page.rows;
      cw -= this.page.cols * this.page.margin / 100;
      ch -= this.page.rows * this.page.margin / 100;
      var sz = Math.min(cw, ch);
      if(sz < 20) sz = 20;

      return sz;
    }
  },
  methods:{
    onResized(){
      this.areaWidth = this.$el.clientWidth;
      this.areaHeight = this.$el.clientHeight;
    },

    updateAction(page){
      var pas = [];
      var items = page.items;
      for(var i = 0; i < items.length; i++){
        pas.push({
          host: this.formatHost(items[i].host),
          action: this.formatAction(items[i].action)
        });
      }
      this.actions = pas;
    },

    onClickButton(ri){
      console.log("%s -> %s", ri.host, ri.action);
      if(!ri.host || !ri.action) return;

      var xhr = new XMLHttpRequest();
      xhr.open("POST", ri.host, true);
      xhr.onload = ()=>{
        if(xhr.status != 200){
          var msg = this.$t("servererror", xhr.status, xhr.statusText);
          if(!ri.ignoreRes){
            this.$emit("notice", "warn", msg);
          }else{
            console.warn(msg);
          }
        }
      };
      xhr.onerror = (ex)=>{
        this.$emit("notice", "error", this.$t("cantconnect", [ri.host]));
      };
      xhr.send(ri.action);
    },

    formatHost(s){
      if(!s) {
        var host = (!this.page || !this.page.host) ? "${localhost}" : this.page.host;
        host = this.formatPost(host);
        return host || "http://localhost";
      }else{
        return this.formatPost(s);
      }
    },
    formatAction(s){
      if(!s) return "";
      return this.formatPost(s);
    },
    formatPost(s){
      if(!s) return "";

      var _s = s.replace(/\$+\{([\w-_]+)\}/g, (m, g)=>{
        if(m[0] == "$" && m[1] == "$") return m.substring(1);
        return this.dictionary[g] || m;
      });
      return _s;
    }
  }
}
</script>

<style scoped>
.grid-view-out{
  position:absolute;
  width:100%;
  height:100%;
  display:flex;
  align-items: center;
  justify-content: center;
}

.grid-view-in{
  display:grid;
}
</style>