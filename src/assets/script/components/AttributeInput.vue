<template>
 <div>
   <md-field>
    <md-icon>{{ icon }}</md-icon>
    <label>{{ label }}</label>
    <md-input
      :max="max"
      :min="min"
      type="number"
      v-model.sync="rank"
      @input="update">
    </md-input>
    <md-chip>{{ totalCost }}</md-chip>
  </md-field>
 </div>
</template>

<script>
export default {
  name: 'attribute-input',
  computed: {
    rank() {
      return this.model.value;
    },
    totalCost() {
      return [...Array(this.model.value)]
        .reduce(
          (sum, v, i) => sum + this.calculateCurrentPointCost(i + 1),
          0
        );
    }
  },
  props: {
    cap: {
      required: true,
      type: Number
    },
    cost: {
      required: true,
      type: Number
    },
    icon: {
      default: '',
      type: String
    },
    initial: {
      default: 0,
      type: Number
    },
    label: {
      required: true,
      type: String
    },
    max: {
      default: 255,
      type: Number
    },
    min: {
      default: 0,
      type: Number
    },
    model: {
      required: true,
      type: Object
    },
    step: {
      default: 10,
      type: Number
    }
  },
  methods: {
    calculateCurrentPointCost(n) {
      // @todo I am sure there is a better way to do this
      let multiplier;
      
      if(n <= this.initial)
        multiplier = 0;
      else if(n <= this.cap)
        multiplier = 1;
      else
        multiplier = Math.ceil(
          (n - this.cap) / this.step
        ) + 1;
      
      return multiplier * this.cost;
    },
    update(e) {
      this.$emit('update:model', {
        // @todo change `cost` to `totalCost`
        cost: this.totalCost,
        value: +e
      });
    }
  }
}
</script>

<style scoped>
  .md-chip {
    font-size:  11px;
    min-width:  45px;
    text-align: center;
  }
</style>
