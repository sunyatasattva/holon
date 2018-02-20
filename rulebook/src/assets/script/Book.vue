<template>
  <div ref="main" class="off-canvas off-canvas-sidebar-show">
    <nav class="off-canvas-sidebar table-of-contents">
      <img src="src/assets/images/logo.png" alt="Holon RPG" class="logo">
    </nav>
    <div class="off-canvas-content book-content">
      <section class="skill-list">
        <h1>Abilità</h1>
        <div 
          v-for="(group, i) in $options.skills"
          class="skill-group-compact">
          <h2>Livello {{ i + 1 }}</h2>
          <skill 
            v-for="skill in group"
            :selectedSkill="selectedSkill"
            :skill="skill"
            :compact="true" 
            @click="selectSkill"
          />
        </div>
        <div 
          v-for="(group, i) in $options.skills"
          class="skill-group-compact"
          :id="`skills-level-${i + 1}`">
          <h2>Livello {{ i + 1 }}</h2>
          <skill v-for="skill in group" :skill="skill" />
        </div>
      </section>
      <section class="talent-list">
        <h1>Talenti</h1>
        <ul>
          <li v-for="talent in $options.talents">
            <h2>{{ talent.name }}</h2>
            <img :src="`src/assets/images/skills-icons/${talent.icon}.png`" alt="">
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script>
import Skill from "./components/Skill.vue";
import skills from "../../../../src/assets/script/modules/skills.json";

function parseRequirements(requirements, curr) {
  let nestedRequirements,
      requirementLevel,
      skill;

  requirements.push(curr);

  if(
    typeof curr === "string" 
    && curr.includes("*")
  ) {
    requirementLevel = curr[1] - 1;

    for(requirementLevel; requirementLevel > 0; requirementLevel--) {
      requirements.push(`*${requirementLevel}`)
    }
  }
  else if(typeof curr === "string") {
    skill = skills.skills.find(skill => skill.id === curr);
    
    nestedRequirements = skill.requirements
      .reduce(parseRequirements, []);
    
    requirements = requirements.concat(nestedRequirements);
  }
  else if( Array.isArray(curr) ) {
    curr.forEach((option) => {
      skill = skills.skills.find(skill => skill.id === option);
      
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);

      curr = curr.concat(nestedRequirements);
    });
    
    requirements.push(curr);
  }
  
  return requirements;
} 

const groupedSkills = skills.skills
  .reduce((arr, skill) => {
    let requirementsLevel = skill.requirements.length,
        group = arr[requirementsLevel] || [];
    
    group.push(skill);
    arr[requirementsLevel] = group;
    
    return arr;
  }, []);

  console.log(groupedSkills)
  
export default {
  name: "book",
  components: {
    Skill
  },
  data() {
    return {
      selectedSkill: {}
    }
  },
  
  methods: {
    selectSkill(skill) {
      this.selectedSkill = skill;
      
      this.selectedSkill.requirements = this.selectedSkill.requirements
        .reduce(parseRequirements, []);
    }
  },
  
  skills: groupedSkills,
  talents: skills.talents
}
</script>

<style lang="scss">
  @import "../style/core";
  
  a {
    color: $blue-color;
    opacity: 0.9;
    
    &:hover {
      color: $blue-color;
      border-bottom: 1px solid $blue-color;
      text-decoration: none;
      opacity: 1;
    }
  }
  
  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing:  antialiased;
    background-color:        $dark-color;
    color:                   $gray-color-light;
    font-family:             ProximaNova,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
    text-rendering:          optimizeLegibility;
  }
  
  em {
    color: $green-color;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: $blue-color;
    font-weight: 300;
  }
  
  .logo {
    width: 150px;
  }
  
  .off-canvas {
    .book-content {
      padding-right: 4rem;
    }
    .table-of-contents {
      background-color: $dark-color-darker;
      padding: $padding;
    }
  }
  
  .skill-group {
    margin: $line-height 0;
  }
</style>