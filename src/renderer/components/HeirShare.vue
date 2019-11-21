<template>
    <b-container id="wrapper" fluid :class="['mt-2']">
        <nav aria-label="breadcrumb" class="shadow">
            <!-- <b-breadcrumb :items="breadcrumb" :class="['bg-dark', 'text-white']"></b-breadcrumb> -->
            <ol class="breadcrumb bg-dark text-white">
                <li
                v-for="(item, index) in breadcrumb"
                v-bind:class="{active : index === (breadcrumb.length - 1)}"
                >
                <small>{{index == 0 ? item.legend : item.legend + "　/　"}}</small>
                </li>
            </ol>
        </nav>
        <div class="row mb-2">
            <div class="col">
                <span class="text-danger font-weight-bold">＊</span>
                被繼承人持分：
                <input
                    type="number"
                    min="1"
                    style="width:4rem"
                    v-model="heir_denominator"
                    @change="filter"
                />
                分之 1
            </div>
            <div class="col-3">
                <b-btn-group size="sm">
                    <b-button @click="prev">&lt;</b-button>
                    <b-button>|</b-button>
                    <b-button @click="next">&gt;</b-button>
                </b-btn-group>
            </div>
        </div>
        <fieldset class="border p-2" v-show="wizard.s0.seen">
        <legend class="w-auto">{{wizard.s0.legend}}</legend>
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

        <!-- step 1 光復前 -->
        <fieldset class="border p-2" v-show="wizard.s1.seen">
        <legend class="w-auto">{{wizard.s1.legend}}</legend>
        <div class="row text-center">
            <label class="col-6">
            <input type="radio" v-model="wizard.s1.value" value="public" @change="s1ValueSelected" /> 家產
            </label>
            <label class="col-6">
            <input type="radio" v-model="wizard.s1.value" value="private" @change="s1ValueSelected" /> 私產
            </label>
        </div>
        <div class="border-top border-primary pt-2" v-show="seen_s1_public">
            <ol class="d-block">
            <li>
                法定推定財產繼承人係
                <strong class="text-primary">男子</strong>直系卑親屬，以親等近者為優先。親等相同之
                <strong class="text-primary">男子</strong>有數人時，共同均分繼承。
            </li>
            <li>無法定之推定戶主繼承人時，指定及選定之財產繼承人繼承。</li>
            </ol>人數：
            <input
            type="number"
            min="0"
            class="num-counter"
            v-model="wizard.s1.public.count"
            @change="filter"
            />
            <span v-show="seen_s1_pub_msg">
            每人之應繼份為
            <span class="text-primary">{{wizard.s1.public.count * heir_denominator}} 分之 1</span>。
            </span>
        </div>
        <div class="border-top border-primary pt-2" v-show="seen_s1_private">
            <h6>* 僅有法定繼承人，順序如下：</h6>
            <ol class="d-block">
            <li v-show="seen_s1_private_1">
                人數：
                <input
                type="number"
                min="0"
                class="num-counter"
                v-model="wizard.s1.private.child"
                @change="filter"
                />
                【直系卑親屬，以親等近者為優先。親等相同之男子有數人時，共同均分之。】
                <br />
                <span v-show="seen_s1_private_1_msg">
                直系卑親屬每人之應繼份為
                <span
                    class="text-primary"
                >{{wizard.s1.private.child * heir_denominator}} 分之 1</span>。
                </span>
            </li>
            <li v-show="seen_s1_private_2">
                人數：
                <input
                type="number"
                min="0"
                max="1"
                class="num-counter"
                v-model="wizard.s1.private.spouse"
                @change="filter"
                />
                【配偶】
                <br />
                <span v-show="seen_s1_private_2_msg">
                配偶應繼份為
                <span class="text-primary">{{wizard.s1.private.spouse * heir_denominator}} 分之 1</span>。
                </span>
            </li>
            <li v-show="seen_s1_private_3">
                人數：
                <input
                type="number"
                min="0"
                class="num-counter"
                v-model="wizard.s1.private.parent"
                @change="filter"
                />
                【直系尊親屬，親等不同以親等近者為先，同一親等有2人以上，共同均分之。】
                <br />
                <span v-show="seen_s1_private_3_msg">
                直系尊親屬每人之應繼份為
                <span
                    class="text-primary"
                >{{wizard.s1.private.parent * heir_denominator}} 分之 1</span>。
                </span>
            </li>
            <li v-show="seen_s1_private_4">
                人數：
                <input
                type="number"
                min="0"
                max="1"
                class="num-counter"
                v-model="wizard.s1.private.household"
                @change="filter"
                />
                【戶主】
                <br />
                <span v-show="seen_s1_private_4_msg">
                戶主應繼份為
                <span
                    class="text-primary"
                >{{wizard.s1.private.household * heir_denominator}} 分之 1</span>。
                </span>
            </li>
            </ol>
        </div>
        </fieldset>

        <!-- step 2 光復後 -->
        <fieldset class="border p-2" v-show="wizard.s2.seen">
        <legend class="w-auto">{{wizard.s2.legend}}</legend>TODO ...
        </fieldset>
    </b-container>
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
      breadcrumb: []
    };
  },
  methods: {
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
      e.target.value = val.replace(/^0+/, ""); // remove leading zero
      //this.heir_denominator = val || 1;
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
  components: {},
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
#wrapper {
  font-family: "微軟正黑體", "Microsoft JhenHei", sans-serif;
  font-size: 0.85rem;
}
.num-counter {
  width: 2.2rem;
}
</style>