<template>
  <b-container id="wrapper" fluid>
    <div class="bg-zhongli p-2">
      <b-img :src="require('@/assets/zhongli_logo.png')" fluid center alt="Zhongli LOGO"></b-img>
    </div>
    <div class="my-2">
      <div class="float-right">
        <b-button pill @click="reset" variant="outline-success" size="sm">重新開始</b-button>
      </div>
      <div>
        <span class="text-danger font-weight-bold">＊</span>
        被繼承人持分：
        <input
          type="number"
          min="1"
          step="1"
          pattern="\d+"
          style="width:4rem"
          v-model="heir_denominator"
          @change="filterNonNumber"
        />
        分之 1
      </div>
    </div>

    <h4 v-if="now_step">
      <b-badge pill>{{now_step.title}}</b-badge>
    </h4>

    <!-- step 0 選擇繼承事實發生時間點 -->
    <fieldset class="border p-2" v-show="wizard.s0.seen">
      <legend class="w-auto">{{wizard.s0.legend}}</legend>
      <div class="row text-center">
        <label
          class="col"
          v-b-popover.hover.bottom="{ customClass: 'my-popover', content: '民國34年10月24日以前' }"
        >
          <input type="radio" v-model.number="wizard.s0.value" value="-1" @change="s0ValueSelected" /> 光復前
        </label>
        <label
          class="col"
          v-b-popover.hover.bottom="{ customClass: 'my-popover', content: '民國34年10月25日以後' }"
        >
          <input type="radio" v-model.number="wizard.s0.value" value="0" @change="s0ValueSelected" /> 光復後
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
      <div class="border-top border-dark pt-2" v-show="seen_s1_public">
        <ol class="d-block">
          <li>
            法定推定財產繼承人係
            <strong class="text-primary">男子</strong>直系卑親屬，以親等近者為優先。親等相同之
            <strong class="text-primary">男子</strong>有數人時，共同均分繼承。
          </li>
          <li>無法定之推定戶主繼承人時，指定及選定之財產繼承人繼承。</li>
        </ol>
        <div class="ml-4">
          人數：
          <input
            type="number"
            min="0"
            class="num-counter"
            v-model="wizard.s1.public.count"
            @change="filterNonNumber"
          />
          <h5 class="d-inline">
            <b-badge v-show="seen_s1_pub_msg" variant="warning">
              每人之應繼份為
              <b-badge variant="light">{{Math.abs(wizard.s1.public.count * heir_denominator)}} 分之 1</b-badge>
            </b-badge>
          </h5>
        </div>
      </div>
      <div class="border-top border-dark pt-2" v-show="seen_s1_private">
        <h6 class="d-inline">* 僅有法定繼承人，順序如下：</h6>
        <b-link href="#" @click="resetS1PrivateCounter">重設</b-link>
        <ol class="d-block">
          <li v-show="seen_s1_private_1">
            人數：
            <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s1.private.child"
              @change="filterNonNumber"
            />
            <label
              v-show="!seen_s1_private_1_msg"
              v-b-popover.hover.top="{ customClass: 'my-popover', content:'以親等近者為優先。親等相同之男子有數人時，共同均分之'}"
            >直系卑親屬</label>
            <h5 class="d-inline">
              <b-badge v-show="seen_s1_private_1_msg" variant="warning">
                直系卑親屬每人之應繼份為
                <b-badge
                  variant="light"
                >{{Math.abs(wizard.s1.private.child * heir_denominator)}} 分之 1</b-badge>
              </b-badge>
            </h5>
          </li>
          <li v-show="seen_s1_private_2">
            人數：
            <input
              type="number"
              min="0"
              max="1"
              class="num-counter"
              v-model="wizard.s1.private.spouse"
              @change="filterNonNumber"
            />
            <label v-show="!seen_s1_private_2_msg">配偶</label>
            <h5 class="d-inline">
              <b-badge v-show="seen_s1_private_2_msg" variant="warning">
                配偶應繼份為
                <b-badge
                  variant="light"
                >{{Math.abs(wizard.s1.private.spouse * heir_denominator)}} 分之 1</b-badge>
              </b-badge>
            </h5>
          </li>
          <li v-show="seen_s1_private_3">
            人數：
            <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s1.private.parent"
              @change="filterNonNumber"
            />
            <label
              v-show="!seen_s1_private_3_msg"
              v-b-popover.hover.bottom="{ customClass: 'my-popover', content: '親等不同以親等近者為先，同一親等有2人以上，共同均分之'}"
            >直系尊親屬</label>
            <h5 class="d-inline">
              <b-badge v-show="seen_s1_private_3_msg" variant="warning">
                直系尊親屬每人之應繼份為
                <b-badge
                  variant="light"
                >{{Math.abs(wizard.s1.private.parent * heir_denominator)}} 分之 1</b-badge>
              </b-badge>
            </h5>
          </li>
          <li v-show="seen_s1_private_4">
            人數：
            <input
              type="number"
              min="0"
              max="1"
              class="num-counter"
              v-model="wizard.s1.private.household"
              @change="filterNonNumber"
            />
            <label v-show="!seen_s1_private_4_msg">戶主</label>
            <h5 class="d-inline">
              <b-badge v-show="seen_s1_private_4_msg" variant="warning">
                戶主應繼份為
                <b-badge
                  variant="light"
                >{{Math.abs(wizard.s1.private.household * heir_denominator)}} 分之 1</b-badge>
              </b-badge>
            </h5>
          </li>
        </ol>
      </div>
    </fieldset>

    <!-- step 2 光復後 -->
    <fieldset class="border p-2" v-show="wizard.s2.seen">
      <legend class="w-auto">{{wizard.s2.legend}}</legend>
      <div class="row text-center">
        <label class="col-6">
          <input type="radio" v-model="wizard.s2.value" value="7464" @change="s2ValueSelected" /> 74年6月4日以前
        </label>
        <label class="col-6">
          <input type="radio" v-model="wizard.s2.value" value="7465" @change="s2ValueSelected" /> 74年6月5日以後
        </label>
      </div>
      <div class="border-top border-dark pt-2" v-show="seen_s2_counters">
        <ol class="d-block">
          <li>
            <b-link href="#" @click="resetS2Counter" class="float-right">重設</b-link>
            <b-form-checkbox
              v-model="wizard.s2.spouse"
              value="1"
              unchecked-value="0"
              size="sm"
              inline
              switch
            >
              <span>有配偶？</span>
            </b-form-checkbox>
            <span v-show="seen_s2_spouse_msg" class="h5">
              <b-badge variant="warning">
                應繼份為
                <b-badge variant="light">{{val_s2_spouse_ratio}}</b-badge>
              </b-badge>
            </span>
          </li>
          <li v-show="seen_s2_children">
            <div>
              <label>
                直系卑親屬
                <span v-show="seen_s2_raising_children">(含養子女)</span>
              </label>人數：
              <input
                type="number"
                min="0"
                class="num-counter"
                v-model="wizard.s2.children"
                @change="filterNonNumber"
              />
              <span v-show="seen_s2_children_msg" class="h5">
                <b-badge variant="warning">
                  每人應繼份為
                  <b-badge variant="light">{{val_s2_children_ratio}}</b-badge>
                </b-badge>
              </span>
            </div>
            <div v-show="!seen_s2_raising_children">
              <label>養子女</label>人數：
              <input
                type="number"
                min="0"
                class="num-counter"
                v-model="wizard.s2.raising_children"
                @change="filterNonNumber"
              />
              <span v-show="seen_s2_raising_children_msg" class="h5">
                <b-badge variant="warning">
                  每人應繼份為
                  <b-badge variant="light">{{val_s2_raising_children_ratio}}</b-badge>
                </b-badge>
              </span>
            </div>
          </li>
          <li v-show="seen_s2_parents">
            <label>父母</label>人數：
            <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s2.parents"
              @change="filterNonNumber"
            />
            <span v-show="seen_s2_parents_msg" class="h5">
              <b-badge variant="warning">
                每人應繼份為
                <b-badge variant="light">{{val_s2_parents_ratio}}</b-badge>
              </b-badge>
            </span>
          </li>
          <li v-show="seen_s2_brothers">
            <label>兄弟姊妹</label>人數：
            <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s2.brothers"
              @change="filterNonNumber"
            />
            <span v-show="seen_s2_brothers_msg" class="h5">
              <b-badge variant="warning">
                每人應繼份為
                <b-badge variant="light">{{val_s2_brothers_ratio}}</b-badge>
              </b-badge>
            </span>
          </li>
          <li v-show="seen_s2_grandparents">
            <label>祖父母</label>人數：
            <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s2.grandparents"
              @change="filterNonNumber"
            />
            <span v-show="seen_s2_grandparents_msg" class="h5">
              <b-badge variant="warning">
                每人應繼份為
                <b-badge variant="light">{{val_s2_grandparents_ratio}}</b-badge>
              </b-badge>
            </span>
          </li>
        </ol>
      </div>
    </fieldset>
    
    <div class="my-2">
      <heir-pie-chart v-show="seen_chart" :styles="vueChartStyle" :chartdata="vueChartData" :options="vueChartOptions" />
    </div>
    <p id="copyright" class="text-center text-muted fixed-bottom p-2 my-2 mx-3 bg-white border rounded" style="font-size:0.65rem">
      <a href="https://github.com/pyliu/heir-share" target="_blank" title="View project on Github!"><svg class="octicon octicon-mark-github v-align-middle" height="16" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg></a>
      &nbsp;<strong>&copy; 2019 LIU, PANG-YU</strong>
    </p>
  </b-container>
</template>

<script>
import HeirPieChart from "@/components/HeirPieChart"
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
          title: "步驟2，光復前繼承財產分類",
          legend: "被繼承財產種類",
          seen: false,
          value: "",
          public: {
            count: 0
          },
          private: {
            child: 0,
            spouse: 0,
            parent: 0,
            household: 0
          }
        },
        s2: {
          // 光復後
          title: "步驟2，光復後時段區間",
          legend: "時段區間",
          seen: false,
          value: "",
          children: 0,
          raising_children: 0,
          spouse: 0,
          parents: 0,
          brothers: 0,
          grandparents: 0
        }
      },
      toastCount: 0,
      heir_denominator: 1,
      now_step: null,
      color_codes: [
        "2, 117, 216",
        "92, 184, 92",
        "91, 192, 222",
        "240, 173, 78",
        "217, 83, 79",
        "41, 43, 44",
        "73, 5, 245",
        "201, 65, 149",
        "148, 88, 200",
        "251, 218, 137",
        "193, 247, 215",
        "252, 116, 4",
        "242, 193, 135",
        "60, 108, 4",
        "150, 140, 107",
        "206, 170, 155"
      ],
      color_codes_next: 0,
      vueChartData: {
        labels: [],
        datasets: [{
          label: '繼承分配表',
          data: [],
          borderWidth: 1
        }]
      },
      vueChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        title: true,
        legend: {
			    position: 'right',
          display: true,
          labels: { fontSize: 11 }
        }
      },
      vueChartStyle: {
        height: "180px"
      }
    };
  },
  methods: {
    makeToast: function(content, opts) {
      if (content) {
        this.toastCount++;
        this.$bvToast.toast(
          content,
          Object.assign(
            {
              title: "通知",
              autoHideDelay: 5000,
              appendToast: false,
              noAutoHide: false,
              noHoverPause: false,
              noCloseButton: true,
              solid: false,
              variant: "default",
              toaster: "b-toaster-bottom-right",
              headerClass: "my-toast-header",
              bodyClass: "my-toast-body"
            },
            opts
          )
        );
      }
    },
    reset: function(e) {
      this.wizard.s0.seen = true;
      this.wizard.s0.value = "";
      this.heir_denominator = 1;
      this.now_step = this.wizard.s0;
      this.resetS1(e);
      this.resetS2(e);
    },
    resetS1: function(e) {
      this.wizard.s1.seen = false;
      this.wizard.s1.value = "";
      this.wizard.s1.public.count = 0;
      this.wizard.s1.private.child = 0;
      this.wizard.s1.private.spouse = 0;
      this.wizard.s1.private.parent = 0;
      this.wizard.s1.private.household = 0;
    },
    resetS2: function(e) {
      this.wizard.s2.seen = false;
      this.wizard.s2.value = "";
      this.wizard.s2.children = 0;
      this.wizard.s2.raising_children = 0;
      this.wizard.s2.spouse = 0;
      this.wizard.s2.parents = 0;
      this.wizard.s2.brothers = 0;
      this.wizard.s2.grandparents = 0;
    },
    filterNonNumber: function(e) {
      let val = e.target.value.replace(/[^0-9]/g, "").replace(/^0+/, ""); // removing non-digit chars, leading zero
      e.target.value = Math.abs(val || 0);
    },
    resetS1PublicCounter: function(e) {
      this.wizard.s1.public.count = 0;
    },
    resetS1PrivateCounter: function(e) {
      this.wizard.s1.private.child = 0;
      this.wizard.s1.private.spouse = 0;
      this.wizard.s1.private.parent = 0;
      this.wizard.s1.private.household = 0;
    },
    resetS2Counter: function(e) {
      this.wizard.s2.children = 0;
      this.wizard.s2.raising_children = 0;
      this.wizard.s2.spouse = 0;
      this.wizard.s2.parents = 0;
      this.wizard.s2.brothers = 0;
      this.wizard.s2.grandparents = 0;
    },
    resetChartData: function() {
      this.vueChartData.labels = [];
      this.vueChartData.datasets[0].data = [];
      this.vueChartData.datasets[0].backgroundColor = [];
      this.vueChartData.datasets[0].borderColor = [];
    },
    addChartData: function(name, servings, count = 1) {
        for (let i = 0; i < count; i++) {
          this.vueChartData.labels.push(name);
          this.vueChartData.datasets[0].data.push(parseInt(servings));
          let color = this.color_codes[this.color_codes_next++ % this.color_codes.length];
          this.vueChartData.datasets[0].backgroundColor.push(`rgba(${color}, 0.8)`);
          this.vueChartData.datasets[0].borderColor.push(`rgba(${color}, 1)`);
        }
        // hide legend if count over 16
        this.vueChartOptions.legend.display = this.vueChartData.labels.length <= 16;
    },
    recalS2Servings: function() {
      this.resetChartData();
      if (this.wizard.s2.children > 0 || this.wizard.s2.raising_children > 0) {
        this.addChartData("配偶", 2, this.wizard.s2.spouse);
        this.addChartData("直系卑親屬", 2, this.wizard.s2.children);
        this.addChartData("養子女", 1, this.wizard.s2.raising_children);
      } else if (this.wizard.s2.parents > 0) {
        this.addChartData("配偶", this.wizard.s2.parents, this.wizard.s2.spouse);
        this.addChartData("父母", 1, this.wizard.s2.parents);
      } else if (this.wizard.s2.brothers > 0) {
        this.addChartData("配偶", this.wizard.s2.brothers, this.wizard.s2.spouse);
        this.addChartData("兄弟姊妹", 1, this.wizard.s2.brothers);
      } else if (this.wizard.s2.grandparents > 0) {
        this.addChartData("配偶", this.wizard.s2.grandparents * 4, this.wizard.s2.spouse);
        this.addChartData("祖父母", 2, this.wizard.s2.grandparents);
      }
      else if (this.wizard.s2.spouse > 0) {
        this.addChartData("配偶", 1);
      }
    },
    s0ValueSelected: function(e) {
      switch (this.wizard.s0.value) {
        case -1:
          // 光復前
          this.now_step = this.wizard.s1;
          break;
        case 0:
          // 光復後
          this.now_step = this.wizard.s2;
          break;
        default:
          console.error(`Not supported: ${this.wizard.s0.value}.`);
          return;
      }
      // hide all steps first
      for (let step in this.wizard) {
        this.wizard[step].seen = false;
      }
      this.now_step.seen = true;
    },
    s1ValueSelected: function(e) {
      this.resetS1PublicCounter(e);
      this.resetS1PrivateCounter(e);
    },
    s2ValueSelected: function(e) {
      this.resetS2Counter(e);
    },
    disableDrag: function(e) {
      e.preventDefault();
      e.dataTransfer.effectAllowed = 'none';
      e.dataTransfer.dropEffect = 'none';
    }
  },
  watch: {
    "wizard.s1.public.count": function() {
      this.resetChartData();
      this.addChartData("繼承人", 1, this.wizard.s1.public.count);
    },
    "wizard.s1.private.child": function() {
      this.resetChartData();
      this.addChartData("直系卑親屬(男)", 1, this.wizard.s1.private.child);
    },
    "wizard.s1.private.spouse": function() {
      if (this.wizard.s1.private.spouse > 1) {
        this.wizard.s1.private.spouse = 1;
      }
      this.resetChartData();
      this.addChartData("配偶", 1, this.wizard.s1.private.spouse);
    },
    "wizard.s1.private.parent": function() {
      this.resetChartData();
      this.addChartData("直系尊親屬", 1, this.wizard.s1.private.parent);
    },
    "wizard.s1.private.household": function() {
      if (this.wizard.s1.private.household > 1) {
        this.wizard.s1.private.household = 1;
      }
      this.resetChartData();
      this.addChartData("戶主", 1, this.wizard.s1.private.household);
    },
    "wizard.s2.spouse": function() {
      this.recalS2Servings();
    },
    "wizard.s2.children": function() {
      this.recalS2Servings();
    },
    "wizard.s2.raising_children": function() {
      this.recalS2Servings();
    },
    "wizard.s2.parents": function() {
      this.recalS2Servings();
    },
    "wizard.s2.brothers": function() {
      this.recalS2Servings();
    },
    "wizard.s2.grandparents": function() {
      this.recalS2Servings();
    }
  },
  computed: {
    val_s2_children_spouse_total_deno: function() {
      return (
        parseInt(this.wizard.s2.children * 2) +
        parseInt(this.wizard.s2.raising_children) +
        parseInt(this.wizard.s2.spouse * 2)
      ) * this.heir_denominator;
    },
    val_s2_spouse_ratio: function() {
      if (this.wizard.s2.children > 0 || this.wizard.s2.raising_children > 0) {
        let deno = this.val_s2_children_spouse_total_deno;
        return this.wizard.s2.raising_children > 0 ? `${deno} 分之 2` : `${deno / 2} 分之 1`;
      } else if (this.wizard.s2.parents > 0 || this.wizard.s2.brothers > 0) {
        return `${this.heir_denominator * 2} 分之 1`;
      } else if (this.wizard.s2.grandparents > 0) {
        return `${this.heir_denominator * 3} 分之 2`;
      }
      return `${this.heir_denominator} 分之 1`;
    },
    val_s2_children_ratio: function() {
      let deno = this.val_s2_children_spouse_total_deno;
      return this.wizard.s2.raising_children > 0 ? `${deno} 分之 2` : `${deno / 2} 分之 1`;
    },
    val_s2_raising_children_ratio: function() {
      return `${this.val_s2_children_spouse_total_deno} 分之 1`;
    },
    val_s2_parents_ratio: function() {
      if (this.wizard.s2.spouse == 0) {
        return `${this.wizard.s2.parents * this.heir_denominator} 分之 1`;
      } else {
        return `${this.wizard.s2.parents * 2 * this.heir_denominator} 分之 1`;
      }
    },
    val_s2_brothers_ratio: function() {
      if (this.wizard.s2.spouse == 0) {
        return `${this.wizard.s2.brothers * this.heir_denominator} 分之 1`;
      } else {
        return `${this.wizard.s2.brothers * 2 * this.heir_denominator} 分之 1`;
      }
    },
    val_s2_grandparents_ratio: function() {
      if (this.wizard.s2.spouse == 0) {
        return `${this.wizard.s2.grandparents * this.heir_denominator} 分之 1`;
      } else {
        return `${this.wizard.s2.grandparents * 3 * this.heir_denominator} 分之 1`;
      }
    },
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
    },
    seen_s2_counters: function() {
      return this.wizard.s2.value;
    },
    seen_s2_spouse_msg: function() {
      return this.wizard.s2.spouse > 0;
    },
    seen_s2_children: function() {
      return (
        this.wizard.s2.parents == 0 &&
        this.wizard.s2.brothers == 0 &&
        this.wizard.s2.grandparents == 0
      );
    },
    seen_s2_children_msg: function() {
      return this.wizard.s2.children > 0;
    },
    seen_s2_raising_children: function() {
      return this.wizard.s2.value == "7465";
    },
    seen_s2_raising_children_msg: function() {
      return this.wizard.s2.raising_children > 0;
    },
    seen_s2_parents: function() {
      return (
        this.wizard.s2.children == 0 &&
        this.wizard.s2.raising_children == 0 &&
        this.wizard.s2.brothers == 0 &&
        this.wizard.s2.grandparents == 0
      );
    },
    seen_s2_parents_msg: function() {
      return this.wizard.s2.parents > 0;
    },
    seen_s2_brothers: function() {
      return (
        this.wizard.s2.parents == 0 &&
        this.wizard.s2.raising_children == 0 &&
        this.wizard.s2.children == 0 &&
        this.wizard.s2.grandparents == 0
      );
    },
    seen_s2_brothers_msg: function() {
      return this.wizard.s2.brothers > 0;
    },
    seen_s2_grandparents: function() {
      return (
        this.wizard.s2.parents == 0 &&
        this.wizard.s2.raising_children == 0 &&
        this.wizard.s2.brothers == 0 &&
        this.wizard.s2.children == 0
      );
    },
    seen_s2_grandparents_msg: function() {
      return this.wizard.s2.grandparents > 0;
    },
    seen_chart: function() {
      return this.vueChartData.labels.length > 0;
    }
  },
  components: { HeirPieChart },
  mounted: function() {
    // like jQuery ready
    this.now_step = this.wizard.s0;
    // this.makeToast("mounted!", {
    //   variant: "info",
    //   noAutoHide: false,
    //   title: "啟動"
    // });
    window.addEventListener( 'dragenter' , this.disableDrag, false );
    window.addEventListener( 'dragover' , this.disableDrag);
    window.addEventListener( 'drop' , this.disableDrag);
  }
};
</script>

<style scoped>
@font-face {
  font-family: "Microsoft JhenHei";
  src: url(~@/assets/msjh.ttf) format("truetype");
}
#wrapper {
  font-family: "Microsoft JhenHei", 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
}
.bg-zhongli {
  background-color: #7dc750;
}
.num-counter {
  width: 2.2rem;
  /* height: 1.3rem */
}
fieldset {
  font-size: 0.9rem;
}
fieldset legend {
  font-size: 1.1rem;
  font-weight: bold;
}
#copyright {
  font-size: 0.7rem;
}
.my-toast-header,
.my-toast-body {
  font-size: 0.75rem !important;
  padding: 2px 2px 2px 10px !important;
}
.b-toaster-slot {
  width: 33% !important;
}
.my-popover {
  font-size: 0.75rem !important;
}
</style>