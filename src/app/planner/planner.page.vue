<template>
  <div class="wrap">
    <div class="planner">
      <!-- 'Show Archived' checkbox -->
      <div class="filters">
        <input 
          class="show-archived" 
          id="showArchivedCheckbox" 
          type="checkbox" 
          v-model="filters.archived" >
        <label for="showArchivedCheckbox">Show Archived</label>
      </div>
      <hr>
      <!-- Plan Chips -->
      <div class="chips-wrap plan-chips">
        <div class="section-title">
          <h3>Plans</h3>
          <button 
            class="help-icon" 
            v-html="helpIconSvg" 
            @click="helpClick(helpPlanChipsModal, 'Plan List')"/>
        </div>
        <chips-list 
          name="Plan" 
          name-prop="title"
          :data-array="allPlans"
          :filter-chips="showPlan"
          :is-deletable="isDeletable"
          @add="addPlan"
          @delete="archivePlan"
          @rearrange="rearrangePlan"
          @restore="restorePlan"
          @update="renamePlan"/>
      </div>
      <hr>
      <plans-list 
        ref="plansList" 
        :filter-plans="showPlan" 
        :filter-sections="showSection"/>
    </div>

    <!-- Plans: [?] Modal -->
    <div style="display: none">
      <div 
        class="help" 
        ref="helpPlanChipsModal">
        <p>This is the plan list. It's the easiest place to add, archive, restore, rename, and rearrange plans.</p>
        <p>To add a plan, type its name into the "New Plan" box and click "Add".</p>
        <p>
          To archive a plan, click the "X" next to its name in the list.
          Archiving a plan removes it from your document without deleting it permanently.
        </p>
        <p>To restore an archived plan, check the "Show Archived" box, then click the "+" next to its name in the list.</p>
        <p>To rename a plan, click the pencil icon next to its name in the list.</p>
        <p>To rearrange a plan, click and drag it to where you want it to go.</p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ADD_PLAN, ARCHIVE_PLAN, REARRANGE_PLANS,
  RESTORE_PLAN, UPDATE_PLAN,
} from '../shared/chapters.store'
import ChipsList from '../shared/chipsList.vue'
import guid from '../shared/guid'
import Octicons from 'octicons'
import PlansList from '../shared/plansList.vue'
import swal from 'sweetalert'
import { ValidateTitle } from '../shared/validate'

export default {
  components: {
    ChipsList,
    PlansList,
  },
  computed: {
    allPlans() {
      return this.$store.state.chapters.plans || []
    },
    viewingPlans() {
      return (this.allPlans
        .filter(plan => !plan.archived || this.filters.archived))
    },
  },
  data() {
    return {
      filters: {
        archived: false,
      },
      helpIconSvg: Octicons.question.toSVG({
        class: 'help-icon--svg',
        height: 16,
        width: 16,
      }),
    }
  },
  methods: {
    addPlan(title) {
      if (!ValidateTitle('plan', title)) {
        return
      }

      const plan = {
        archived: false,
        guid: guid(),
        title,
        sections: [],
      }

      this.$store.commit(ADD_PLAN, { plan })
    },
    archivePlan({ index }) {
      this.$store.commit(ARCHIVE_PLAN, { plan: this.allPlans[index] })

      if (index === this.activePlanIndex) {
        this.activePlanIndex = -1
      }
    },
    helpClick(content, title) {
      swal({
        content,
        title,
      })
    },
    isDeletable(chip) {
      return !chip.archived
    },
    rearrangePlan(plans) {
      this.$store.commit(REARRANGE_PLANS, { plans })
    },
    renamePlan({ index, value: newTitle }) {
      if (!ValidateTitle('plan', newTitle)) {
        return
      }

      this.$store.commit(UPDATE_PLAN, {
        plan: this.allPlans[index],
        newTitle,
      })
    },
    restorePlan({ index }) {
      this.$store.commit(RESTORE_PLAN, { plan: this.allPlans[index] })
    },
    showPlan(plan) {
      return this.viewingPlans.includes(plan)
    },
    showSection(section) {
      return !section.archived || this.filters.archived
    },
  },
  mounted() {
    this.helpPlanChipsModal = this.$refs.helpPlanChipsModal

    const planGuid = this.$route.query.plan
    if (planGuid) {
      const activePlan = this.allPlans.find(plan => plan.guid === planGuid)
      if (activePlan.archived) {
        this.filters.archived = true
      }

      this.$refs.plansList.selectPlan(this.allPlans.indexOf(activePlan))
    }

    this.$router.replace('/plan')
  },
}
</script>

<style scoped>
.wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.planner {
  display: block;
  flex: 1;
  max-width: 1050px;
}

.filters {
  margin: 10px 0;
}

.chips-wrap {
  border-left: 2px solid rgba(13, 91, 166, 0.5);
  margin-bottom: 16px;
  padding-bottom: 4px;
  padding-left: 8px;
  padding-top: 4px;
}

.section-title {
  align-items: center;
  display: flex;
  flex-direction: row;
}
</style>
