<template>
    <b-container id="wrapper" fluid :class="['mt-2']">
        <b-img :src="require('@/assets/zhongli_logo.png')" fluid center alt="Responsive image" height="100px"></b-img>
        <!-- <nav aria-label="breadcrumb" class="shadow">
            <b-breadcrumb :items="breadcrumb" :class="['bg-dark', 'text-white']"></b-breadcrumb>
            <ol class="breadcrumb bg-dark text-white">
                <li
                v-for="(item, index) in breadcrumb"
                v-bind:class="{active : index === (breadcrumb.length - 1)}"
                >
                <small>{{index == 0 ? item.legend : item.legend + "　/　"}}</small>
                </li>
            </ol>
        </nav> -->
        <div class="my-2">
            <div class="float-right">
                <b-btn-group size="sm">
                    <b-button @click="prev" variant="outline-success">&lt;</b-button>
                    <!-- <b-button variant="outline-dark">|</b-button> -->
                    <b-button @click="next" variant="outline-success">&gt;</b-button>
                </b-btn-group>
            </div>
            <div>
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
            </ol>
            <div class="ml-4">
              人數：
              <input
              type="number"
              min="0"
              class="num-counter"
              v-model="wizard.s1.public.count"
              @change="filter"
              />
              <h5 class="d-inline">
                <b-badge v-show="seen_s1_pub_msg" variant="warning">
                  每人之應繼份為
                  <b-badge variant="light">{{wizard.s1.public.count * heir_denominator}} 分之 1</b-badge>
                </b-badge>
              </h5>
            </div>
        </div>
        <div class="border-top border-primary pt-2" v-show="seen_s1_private">
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
                @change="filter"
                />
                <label v-show="!seen_s1_private_1_msg">直系卑親屬，以親等近者為優先。親等相同之男子有數人時，共同均分之。</label>
                <h5 class="d-inline">
                  <b-badge v-show="seen_s1_private_1_msg" variant="warning">
                    直系卑親屬每人之應繼份為
                    <b-badge variant="light">{{wizard.s1.private.child * heir_denominator}} 分之 1</b-badge>
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
                @change="filter"
                />
                <label v-show="!seen_s1_private_2_msg">配偶。</label>
                <h5 class="d-inline">
                  <b-badge v-show="seen_s1_private_2_msg" variant="warning">
                    配偶應繼份為
                    <b-badge variant="light">{{wizard.s1.private.spouse * heir_denominator}} 分之 1</b-badge>
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
                @change="filter"
                />
                <label v-show="!seen_s1_private_3_msg">直系尊親屬，親等不同以親等近者為先，同一親等有2人以上，共同均分之。</label>
                <h5 class="d-inline">
                  <b-badge v-show="seen_s1_private_3_msg" variant="warning">
                    直系尊親屬每人之應繼份為
                    <b-badge variant="light">{{wizard.s1.private.parent * heir_denominator}} 分之 1</b-badge>
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
                @change="filter"
                />
                <label v-show="!seen_s1_private_4_msg">戶主。</label>
                <h5 class="d-inline">
                  <b-badge v-show="seen_s1_private_4_msg" variant="warning">
                    戶主應繼份為
                    <b-badge variant="light">{{wizard.s1.private.household * heir_denominator}} 分之 1</b-badge>
                  </b-badge>
                </h5>
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
let trim = text => {
	if (isEmpty(text)) {
		return "";
	}
	return text.replace(/[^a-zA-Z0-9]/g, "");
}

let isEmpty = variable => {
	if (variable === undefined || trim(variable) == "") {
		return true;
	}
	
	if (typeof variable == "object" && variable.length == 0) {
		return true;
	}
	return false;
}

let showAlert = opts => {
	let msg = opts.message;
	if (!isEmpty(msg)) {
		let type = "alert-warning";
		switch (opts.type) {
			case "danger":
			case "red":
				type = "alert-danger";
				break;
			case "warning":
			case "yellow":
				type = "alert-warning";
				break;
			case "success":
			case "green":
				type = "alert-success";
				break;
			default:
				type = "alert-info";
				break;
		}
		
		// singleton :D
		if (!window.alertApp) {
			initAlertUI();
		}

		// close alert after 5 secs
		let timeout = opts.timeout;
		if (window.alertApp.hide_timer_handle !== null) { clearTimeout(window.alertApp.hide_timer_handle); }
		window.alertApp.hide_timer_handle = setTimeout(() => {
			window.alertApp.seen = false;
			window.alertApp.hide_timer_handle = null;
		}, isEmpty(timeout) || isNaN(timeout) ? 5000 : timeout);

		window.alertApp.message = msg;
		window.alertApp.type = type;
		window.alertApp.seen = true;

		// normal usage, you want to attach event to the element in the alert window
		if (typeof opts.callback == "function") {
			setTimeout(opts.callback, 250);
		}
	}
}

let showModal = opts => {
	let body = opts.body;
	let title = opts.title;
	let size = opts.size;	// sm, md, lg, xl
	let callback = opts.callback;
	if (isEmpty(title)) {
		title = "... 請輸入指定標題 ...";
	}
	if (isEmpty(body)) {
		body = "... 請輸入指定內文 ...";
	}
	if (isEmpty(size)) {
		size = "md";
	}
	
	let modal_element = $("#bs_modal_template");
	if (modal_element.length == 0) {
        initModalUI();
        modal_element = $("#bs_modal_template");
    }
	
	if (modal_element.is(":visible")) {
		closeModal(() => { showModal(opts); });
		return;
	}

	// Try to use Vue.js
	window.modalApp.title = title;
	window.modalApp.body = body;
	window.modalApp.sizeClass = "modal-" + size;
	window.modalApp.optsClass = opts.class || "";

	if (typeof callback == "function") {
		modal_element.one('shown.bs.modal', callback);
	}
	modal_element.one('hidden.bs.modal', () => { window.modalApp.body = ""; });

	// backdrop: 'static' => not close by clicking outside dislog
	modal_element.modal({backdrop: 'static'});
}

let closeModal = callback => {
	if (typeof callback == "function") {
		$("#bs_modal_template").one('hidden.bs.modal', callback);
	}
	$("#bs_modal_template").modal("hide");
}

let initModalUI = () => {
	// add modal element to show the popup html message
	if ($("#bs_modal_template").length == 0) {
		$("body").append($.parseHTML(`
			<div class="modal fade" id="bs_modal_template" tabindex="-1" role="dialog" aria-labelledby="bs_modal_template" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" v-bind:class="sizeClass" role="document">
					<div class="modal-content">
						<com-header :in-title="title"></com-header>
						<com-body :in-body="body" :in-opts-class="optsClass"></com-body>
						<!-- <com-footer></com-footer> -->
					</div>
				</div>
			</div>
		`));
		// Try to use Vue.js
		window.modalApp = new Vue({
			el: '#bs_modal_template',
			data: {
				body: 'Hello Vue!',
				title: 'Hello Vue!',
				sizeClass: 'modal-md',
				optsClass: ''
			},
			components: {
				"com-header": {
					props: ["inTitle"],
					template: `<div class="modal-header">
						<h4 class="modal-title"><span v-html="inTitle"></span></h4>
						<button type="button" class="close" data-dismiss="modal">&times;</button>
					</div>`
				},
				"com-body": {
					props: ["inOptsClass", "inBody"],
					template: `<div class="modal-body" :class="inOptsClass">
					<p><span v-html="inBody"></span></p>
				</div>`
				},
				"com-footer": {
					template: `<div class="modal-footer">
						<button type="button" class="btn btn-light" data-dismiss="modal">關閉</button>
					</div>`
				}
			}
		});
	}
}

let initAlertUI = () => {
	// add modal element to show the popup html message
	if ($("#bs_alert_template").length == 0) {
		$("body").append($.parseHTML(`
			<div v-show="seen" id="bs_alert_template" class="alert alert-dismissible alert-fixed shadow" :class="type" role="alert" @mouseover="mouseOver" @mouseout="mouseOut">
				<small v-html="message"></small>
				<button type="button" class="close" @click="seen = false">
					<span aria-hidden="true">&times;</span>
				</button>
				<div class="progress mt-1" style="height:.2rem">
					<div class="progress-bar bg-light" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
				</div>
			</div>
		`));
		// Try to use Vue.js
		window.alertApp = new Vue({
			el: '#bs_alert_template',
			data: {
				message: 'Hello Alert Vue!',
				type: 'alert-warning',
				seen: false,
				hide_timer_handle: null,
				progress_timer_handle: null,
				progress_counter: 1
			},
			methods: {
				mouseOver: function(e) {
					if (window.alertApp.hide_timer_handle !== null) { clearTimeout(window.alertApp.hide_timer_handle); }
					window.alertApp.disableProgress();
				},
				mouseOut: function(e) {
					window.alertApp.hide_timer_handle = setTimeout(() => {
						window.alertApp.seen = false;
						window.alertApp.hide_timer_handle = null;
					}, 5000);
					window.alertApp.enableProgress();
				},
				enableProgress: () => {
					window.alertApp.disableProgress();
					window.alertApp.progress_timer_handle = setInterval(function() {
						let p = (100 - Math.round(((++this.progress_counter) / 33.33) * 100));
						let wp = p < 0 ? "0%" : `${p}%`;
						$("#bs_alert_template .progress .progress-bar").css("width", wp);
					}, 150);
				},
				disableProgress: () => {
					clearTimeout(window.alertApp.progress_timer_handle);
					$("#bs_alert_template .progress .progress-bar").css("width", "100%");
					this.progress_counter = 1;
				}
			},
			watch: {
				seen: val => {
					val === true ? window.alertApp.enableProgress() : window.alertApp.disableProgress();
				},
				message: val => {
					// always disableProgress inside
					window.alertApp.enableProgress();
				}
			},
			mounted: function() { }
		});
	}
}

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
      let val = e.target.value.replace(/[^0-9]/g, "").replace(/^0+/, ""); // removing non-digit chars, leading zero 
      e.target.value = val || 0;
    },
    resetS1PrivateCounter: function(e) {
      this.wizard.s1.private.child = 0;
      this.wizard.s1.private.spouse = 0;
      this.wizard.s1.private.parent = 0;
      this.wizard.s1.private.household = 0;
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
fieldset {
  font-size: 0.75rem;
}
fieldset legend {
  font-size: 1.1rem;
  font-weight: bold;
}
</style>