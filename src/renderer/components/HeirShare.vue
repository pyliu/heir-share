<template>
<div>
    <span class="text-danger font-weight-bold">＊</span> <span>被繼承人持分：</span>
    <input type="number" min="1" v-model.lazy="heir_denominator" @change="filter" /> <span>分之 1</span>
    <fieldset v-show="wizard.s0.seen">
        <legend>{{wizard.s0.legend}}</legend>
        <div class="row text-center">
            <label class="col-4"><input type="radio" v-model.number="wizard.s0.value" value="-1" @change="s0ValueSelected" /> 光復前【民國34年10月24日以前】</label>
            <label class="col-4"><input type="radio" v-model.number="wizard.s0.value" value="0" @change="s0ValueSelected" /> 光復後【民國74年6月4日以前】</label>
            <label class="col-4"><input type="radio" v-model.number="wizard.s0.value" value="1" @change="s0ValueSelected" /> 光復後【民國74年6月5日以後】</label>
        </div>
    </fieldset>
</div>
</template>

<script>
export default {
  data: function() {
        return {
            wizard: {
                s0: {
                    title: "步驟1，選擇事實發生區間",
                    legend: "被繼承人死亡時間",
                    seen: true,
                    value: ""
                },
                s1: {  // 光復前
                    title: "步驟2，繼承財產分類",
                    legend: "被繼承財產種類",
                    seen: false,
                    value: "",
                    public: { count: 0 },
                    private: {
                        child: 0,
                        spouse: 0,
                        parent: 0,
                        household: 0
                    }
                },
                s2: {   // 光復後
                    title: "步驟2，選擇輸入繼承人數",
                    legend: "TODO",
                    seen: false,
                    value: ""
                }
            },
            heir_denominator: 1,
            prev_step: {},
            now_step: {},
            breadcrumb: [],
            VueOK: true,
            debug: true
        }
  },
  watch: {},
  methods: {}
}
</script>

<style>

</style>