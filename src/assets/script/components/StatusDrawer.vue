<template>
  <div
    class="status-drawer"
    :class="{ 'is-expanded': isExpanded }"
    @click="isExpanded = !isExpanded">
     <transition-group
       mode="in-out"
       name="status-drawer"
       tag="ul"
       class="status-summary"
       :css="false"
       @before-enter="animationBeforeEnter"
       @enter="animationEnter"
       @leave="animationLeave">
       <li 
         v-for="(status, i) in statii"
         v-if="isExpanded || characterStatus.some(_ => _.id === status.id)"
         :class="{ 'is-active': characterStatus.some(_ => _.id === status.id) }"
         :data-index="i"
         :key="status.id"
         @click.stop="clickHandler(status)">
         <transition name="fade">
           <i
           v-if="isExpanded && status.duration > 0"
           class="material-icons status-duration"
           @click.stop="increaseStatusDuration(status, $event)">
             {{ `filter_${status.duration}` }}
           </i>
         </transition>
         <i class="material-icons status-icon">{{ status.icon }}</i>
         <md-tooltip>{{ status.name }}</md-tooltip>
       </li>
     </transition-group>
    </ul>
  </div>
</template>

<script>
import Velocity from 'velocity-animate';
import Vue from 'vue';

import Mechanics from '_mechanics';
  
function staggeredAnimation(opts) {
  const { el, complete, delay, done } = opts;
  
  setTimeout(() => {
    Velocity(
      el,
      complete,
      { complete: done }
    )
  }, delay);
}
  
export default {
  name: 'status-drawer',
  props: ['character'],
  computed: {
    characterStatus() {
      return this.character.attributes.status;
    },
    statii() {
      return this.$options.mechanics.statii
        .map(
          (status) => {
            const characterStatus = this.characterStatus
              .find( _ => _.id === status.id );
            
            return {
              ...status,
              duration: characterStatus ? characterStatus.duration : 0
            }
          }
        );
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  methods: {
    animationBeforeEnter(el) {
      el.style.opacity = 0;
      el.style.width = 0;
    },
    animationEnter(el, done) {
      const delay = el.dataset.index * 50;
      
      staggeredAnimation({
        el,
        delay,
        done,
        complete: { opacity: 1, width: '20px' },
      });
    },
    animationLeave(el, done) {
      const length = this.$options.mechanics.statii.length;
      const delay = (length - el.dataset.index) * 50;
      
      staggeredAnimation({
        el,
        delay,
        done,
        complete: { opacity: 0, width: 0 },
      });
    },
    clickHandler(status) {
      if(!this.isExpanded)
        this.isExpanded = !this.isExpanded;
      else
        this.character.toggleStatus(
          { id: status.id, duration: 1 }
        )
    },
    increaseStatusDuration(status, e) {
      const change = e.altKey ? -1 : +1;
      const statii = [
        ...this.character.attributes.status
      ];
      
      statii.forEach(_ => {
        if(_.id === status.id)
          _.duration = _.duration + change;
      });
      
      Vue.set(this.character.attributes, 'status', statii);
    }
  },
  mechanics: Mechanics
}
</script>

<style scoped lang="scss">
.fade-enter-active, .fade-leave-active {
  transition:       all .5s;
  transition-delay: .7s;
}
.fade-enter, .fade-leave-to {
  opacity:   0;
  transform: translateY(20px);
}
  
.status-drawer {
  cursor:      e-resize;
  flex-grow:   1;
  line-height: 35px;
  padding:     10px;
  
  &.is-expanded {
    cursor: w-resize;
  }
  
  .material-icons {
    font-size:      16px;
    vertical-align: middle;
  }

  .status-summary {
    li {
      cursor:       pointer;
      margin-right: 5px;
      max-width:    20px;
      position:     relative;
      
      &:last-child {
        margin-right: 0;
      }

      &:hover {
        .status-duration.fade-enter-active, 
        .status-duration.fade-leave-active {
          transition-delay: 0s;
        }
        
        .status-icon {
          opacity: 0.75;
        }
      }

      &.is-active {
        .status-icon {
          opacity: 1;
        }
      }
      
      .status-icon {
        opacity: 0.4;
      }
    }
    
    .status-duration {
      position: absolute;
      top:      -20px;
    }
  }
}
  
.status-summary {
  margin:      0;
  padding:     0;
  user-select: none;

  li {
    cursor:          help;
    display:         inline-block;
    list-style-type: none;
  }
}
</style>
