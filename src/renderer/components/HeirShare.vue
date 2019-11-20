<template>
  <div>
    <b-nav>
      <b-nav-item active>Active</b-nav-item>
      <b-nav-item>Link</b-nav-item>
      <b-nav-item><b-button variant="outline-danger" @click="showAlert" size="sm">Alert</b-button></b-nav-item>
      <b-nav-item disabled>---</b-nav-item>
    </b-nav>

    <b-alert
      :show="bAlertShow"
      dismissible
      fade
      :variant="bAlertType"
      @dismiss-count-down="countDownChanged"
    >This alert will dismiss after {{ bAlertDismissCountdown }} seconds...</b-alert>

    <span class="text-danger font-weight-bold">＊</span>
    被繼承人持分：
    <input type="number" min="1" v-model.lazy="heir_denominator" @change="filter" />
    分之 1
    <fieldset v-show="wizard.s0.seen">
      <legend>{{wizard.s0.legend}}</legend>
      <div class="row text-center">
        <label class="col-4">
          <input type="radio" v-model.number="wizard.s0.value" value="-1" @change="s0ValueSelected" /> 光復前【民國34年10月24日以前】
        </label>
        <label class="col-4">
          <input type="radio" v-model.number="wizard.s0.value" value="0" @change="s0ValueSelected" /> 光復後【民國74年6月4日以前】
        </label>
        <label class="col-4">
          <input type="radio" v-model.number="wizard.s0.value" value="1" @change="s0ValueSelected" /> 光復後【民國74年6月5日以後】
        </label>
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
        s1: {
          // 光復前
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
        s2: {
          // 光復後
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
      bAlertDismissSecs: 5,
      bAlertDismissCountdown: 0,
      bAlertShow: false,
      bAlertType: "info"
    };
  },
  computed: {
    seen_s1_public: function() {
      return this.wizard.s1.value == "public";
    },
    seen_s1_pub_msg: function() {
      return this.wizard.s1.public.count > 0;
    },
    seen_s1_private: function() {
      return this.wizard.s1.value == "private";
    },
    seen_s1_private_1: function() {
      return (
        this.wizard.s1.private.spouse == 0 &&
        this.wizard.s1.private.parent == 0 &&
        this.wizard.s1.private.household == 0
      );
    },
    seen_s1_private_1_msg: function() {
      return this.wizard.s1.private.child > 0;
    },
    seen_s1_private_2: function() {
      return (
        this.wizard.s1.private.child == 0 &&
        this.wizard.s1.private.parent == 0 &&
        this.wizard.s1.private.household == 0
      );
    },
    seen_s1_private_2_msg: function() {
      return this.wizard.s1.private.spouse > 0;
    },
    seen_s1_private_3: function() {
      return (
        this.wizard.s1.private.spouse == 0 &&
        this.wizard.s1.private.child == 0 &&
        this.wizard.s1.private.household == 0
      );
    },
    seen_s1_private_3_msg: function() {
      return this.wizard.s1.private.parent > 0;
    },
    seen_s1_private_4: function() {
      return (
        this.wizard.s1.private.spouse == 0 &&
        this.wizard.s1.private.parent == 0 &&
        this.wizard.s1.private.child == 0
      );
    },
    seen_s1_private_4_msg: function() {
      return this.wizard.s1.private.household > 0;
    }
  },
  components: {
    "counter-input": {
      props: ["max", "min"],
      data: function() {
        return {
          // parent use v-model syntax to get the value changed count
          count: 0
        };
      },
      template: `<span class="qty">
                <span class="minus bg-dark" @click="minusClick">-</span>
                <input type="number" class="count" value="0" :value="count" readonly>
                <span class="plus bg-dark" @click="plusClick">+</span>
            </span>`,
      methods: {
        minusClick: function(e) {
          if (this.min) {
            if (this.count > this.min) {
              this.count--;
            }
          } else {
            // default limit the min to 0
            if (this.count > 0) {
              this.count--;
            }
          }

          // To emit input event to parent => v-model will use the event to update the value watched.
          this.$emit("input", this.count);
        },
        plusClick: function(e) {
          if (this.max) {
            if (this.count < this.max) {
              this.count++;
            }
          } else {
            this.count++;
          }
          this.$emit("input", this.count);
        }
      }
    }
  },
  methods: {
    countDownChanged(dismissCountDown) {
        this.bAlertDismissCountdown = dismissCountDown;
    },
    showAlert() {
        this.bAlertDismissCountdown = this.bAlertDismissSecs
    },
    next: function(e) {
      this.debug = `next triggered ${e.target.tagName}`;
      switch (this.now_step) {
        case this.wizard.s0:
          console.log("next: Now on S0");
          this.s0ValueSelected.call(this, e);
          break;
        case this.wizard.s1:
          console.log("next: Now on s1");
          this.s1ValueSelected.call(this, e);
          break;
        default:
          break;
      }
    },
    prev: function(e) {
      this.debug = `prev triggered ${e.target.tagName}`;
      if (this.breadcrumb.length > 2) {
        this.prev_step = this.breadcrumb.pop();
        this.now_step = this.breadcrumb[this.breadcrumb.length - 1];
        this.prev_step.seen = false;
        this.now_step.seen = true;
      }
    },
    filter: function(e) {
      let val = e.target.value.replace(/[^0-9]/g, ""); // remove non-digit chars
      val = val.replace(/^0+/, ""); // remove leading zero
      this.heir_denominator = val || 1;
    },
    s0ValueSelected: function(e) {
      this.prev_step = this.breadcrumb[this.breadcrumb.length - 1];
      switch (this.wizard.s0.value) {
        case -1:
          this.now_step = this.wizard.s1;
          this.now_step.legend = "光復前【民國34年10月24日以前】";
          break;
        case 0:
        case 1:
          this.now_step = this.wizard.s2;
          this.now_step.legend =
            "光復後【民國74年6月" +
            (this.wizard.s0.value == 1 ? "5日以後】" : "4日以前】");
          break;
        default:
          console.error(`Not supported: ${this.wizard.s0.value}.`);
          showModal({
            title: this.now_step.title,
            body: "請選擇事實發生區間！",
            size: "md"
          });
          return;
      }
      // hide all steps first
      for (let step in this.wizard) {
        this.wizard[step].seen = false;
      }
      this.now_step.seen = true;
      this.breadcrumb.push(this.now_step);
    },
    s1ValueSelected: function(e) {
      switch (this.wizard.s1.value) {
        case "public":
          console.log(`s1: 家產 ${this.wizard.s1.value} selected`);
          break;
        case "private":
          console.log(`s1: 私產 ${this.wizard.s1.value} selected`);
          break;
        default:
          console.error(`Not supported: ${this.wizard.s1.value}.`);
          showModal({
            title: this.now_step.title,
            body: "請選擇【家產】或【私產】！",
            size: "md"
          });
          return;
      }
    }
  },
  mounted: function() {
    // like jQuery ready
    this.now_step = this.wizard.s0;
    this.breadcrumb.push({
      legend: "/　"
    });
    this.breadcrumb.push(this.wizard.s0);
  }
};
</script>

<style>
</style>