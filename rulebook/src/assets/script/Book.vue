<template>
  <div ref="main" class="off-canvas off-canvas-sidebar-show">
    <div class="off-canvas-sidebar">
      <nav class="table-of-contents">
        <img src="src/assets/images/logo.png" alt="Holon RPG" class="logo">

        <ul>
          <li>
            <a href="#section-attributes">Attributi</a>
          </li>
          <li>
            <a href="#section-character-creation">Creazione del personaggio</a>
          </li>
          <li>
            <a href="#section-base-mechanics">Meccaniche di base</a>
          </li>
          <li>
            <a href="#section-combat-mechanics">Combattimento</a>
          </li>
          <li>
            <a href="#skill-list">Abilità</a>
          </li>
          <li>
            <a href="#talent-list">Talenti</a>
          </li>
          <li>
            <a href="#equipment">Equipaggiamento</a>

            <ul>
              <li>
                <a href="#weapon-list">Armi</a>
              </li>
              <li>
                <a href="#armor-list">Armature</a>
              </li>
              <li>
                <a href="#item-list">Oggetti</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
    <div class="off-canvas-content book-content">
      <section id="section-attributes">
        <h1>Attributi</h1>
        <p>Ogni personaggio possiede 8 <em>Attributi</em>:</p>
        <ul class="attribute-list">
          <li>
            <p><i class="material-icons">favorite</i> <em>Resistenza</em> rappresenta la capacità di subire ferite fisiche.</p>
          </li>
          <li>
            <p><i class="material-icons">brightness_7</i> <em>Focus</em> rappresenta la capacità di concentrazione, nonché di mantenere il sangue freddo nelle situazioni più pericolose.</p>
          </li>
          <li>
            <p><i class="material-icons">gps_fixed</i> <em>Mira</em> rappresenta la capacità di colpire un bersaglio.</p>
          </li>
          <li>
            <p><i class="material-icons">flash_on</i> <em>Riflessi</em> rappresenta la capacità di reagire agli attacchi diretti contro la propria persona, nonché la velocità di reazione in circostanze di tensione.</p>
          </li>
          <li>
            <p><i class="material-icons">directions_run</i> <em>Mobilità</em> rappresenta la capacità di muoversi agilmente all'interno del campo di battaglia.</p>
          </li>
          <li>
            <p><i class="material-icons">reply_all</i> <em>Azione</em> rappresenta la acpacità di effettuare azioni significative all'interno di un breve arco di tempo.</p>
          </li>
          <li>
            <p><i class="material-icons">visibility</i> <em>Visibilità</em> rappresenta la chiarezza visiva a lunghe distanze.</p>
          </li>
          <li>
            <p><i class="material-icons">security</i> <em>Robustezza</em> rappresenta la capacità assorbire ferite fisiche.</p>
          </li>
        </ul>
      </section>
      <section id="section-base-mechanics">
        <h1>Meccaniche di base</h1>
        
        <h2>Possibilità di successo e prove</h2>
        <p>Ogni azione ha una <em>possibilità di successo</em> espressa in percentuale. Una <em>prova</em> consiste nel tentare un’azione: si genera un numero casuale da <em class="stat">1 a 100</em>, se il risultato è minore della <em>possibilità di successo</em>, l’azione ha <em class="stat">successo</em>. Viceversa, <em class="stat">fallisce</em>.</p>
        
        <h2>Successi e fallimenti marginali</h2>
        <p>Una <em>prova</em> che ha successo o fallisce <em class="stat">entro ±10%</em> della <em>possibilità di successo</em> viene chiamata <em>successo</em> o <em>fallimento marginale</em>.</p>
        <p>Le conseguenze di <em>successi</em> e <em>fallimenti critici</em> sono specificate nelle rispettive azioni.</p>
        
        <h2>Successi e fallimenti critici</h2>
        <p>Ogni azione ha una <em>possibilità di successo</em> e <em>fallimento critico</em> che va <em class="stat">da 0 a 10</em>. Dove non diversamente specificato, questi valori sono 0. Quando questi valori sono maggiori di 0, un risultato si considera <em>critico</em> quando il valore dell’unità dello stesso è minore o uguale al valore critico (od in ogni caso, se 10).</p>
        <p>Le conseguenze di <em>successi</em> e <em>fallimenti critici</em> sono specificate nelle rispettive azioni.</p>
      </section>
      <section id="section-combat-mechanics">
        <h1>Meccaniche di combattimento</h1>
        
        <h2>Visione</h2>
        <p>Ogni personaggio vede entro un numero di <em class="stat">metri</em> determinati dal <em class="stat">doppio del suo punteggio di</em> <em>Visione</em> in un semicerchio di fronte a sé.</p>
        <p>Dove non altrimenti specificato, un personaggio può effettuare <em>Attacchi</em> solo contro bersagli entro il suo punteggio di <em>Visione</em>.</p>
        <p>La <em>linea visiva</em> è bloccata da una <em>copertura totale</em> fintanto che sia adiacente ad altre due <em>coperture totali</em>.</p>
        
        <h2>Colpire un bersaglio</h2>
        <p>Per colpire un bersaglio, l'<em>attaccante</em> effettua una <em>prova</em> la cui <em>possibilità di successo</em> è calcolata sottraendo alla <em>Mira</em> dell'<em>attaccante</em> la <em>Difesa</em> del <em>difensore</em>, la quale è calcolata aggiungendo ai <em>Riflessi</em> altri modificatori contestuali come, per esempio, <em>condizioni negative</em> e <em>coperture</em>.</p>
        <p>Un bersaglio colpito riceve un numero di <em>ferite</em> come indicato dall'arma dell'<em>attaccante</em>, modificato dal proprio valore di <em>Robustezza</em> (<em class="stat">minimo 1</em>).</p>
        
        <h2>Coperture</h2>
        <p>Esistono due tipi di <em>coperture</em>: <em>copertura parziale</em> e <em>copertura totale</em>. La prima conferisce un <em class="plus">bonus di +20</em> alla <em>Difesa</em>, la seconda un <em class="plus">bonus di +40</em>.</p>
        <p>Un <em>difensore</em> si trova <em class="stat">in copertura</em> rispetto ad un determinato <em>attaccante</em>, se, al momento dell'<em>Attacco</em>, questi si trova subito dietro una <em>copertura</em> ed un piano proiettato da questa interseca la <em>linea visiva</em> dell'<em>Attaccante</em>.</p>
        <p>Un <em>Attacco</em> contro un bersaglio <em class="stat">esposto</em> (non in <em>copertura</em>), ottiene un <em class="plus">bonus di +5</em> alla <em>possibilità di successo critico</em>.</p>
        
        <h2>Ferite</h2>
        <p>Un personaggio può subire un numero di <em>ferite</em> pari al proprio valore di <em>Resistenza</em> prima di rischiare la vita. Ogni <em>ferita</em> subita, conferisce al personaggio una <em class="minus">penalità di 5 punti</em> a tutte le <em>prove</em>.</p>
        <p>Esaurita la <em>Resistenza</em> un personaggio cade privo di sensi. Un personaggio che esaurisce la <em>Resistenza</em> per via di un <em>successo critico</em> o che riceve un numero di <em>danni</em> pari o superiori alla sua <em>Resistenza</em> in un sol colpo, muore istantaneamente.</p>
        <p>Altrimenti, il personaggio sopravvive ed inizia a perdere sangue. Un personaggio può perdere sangue per un numero di turni pari al proprio punteggio di <em>Resistenza</em> prima di perdere la vita.</p>
        
        <h2>Punti azione</h2>
        <p>Ogni personaggio ha un numero finito di <em>punti azione</em> pari al proprio punteggio di <em>Azione</em>; ogni azione usa un numero di predefinito di questi punti. Una volta esauriti questi punti, il <em>turno del personaggio</em> finisce ed egli non può agire più fino al <em>turno successivo</em>.</p>
        
        <h2>Azioni</h2>
        <p>Ogni azione costa un determinato numero di <em>punti azione</em>, certe <em>azioni</em> terminano il turno indipendentemente dal numero di punti azione rimanenti (queste azioni sono indicate con una <em class="stat">“T”</em> tra parentesi nel loro costo).</p>

        <p>Vi sono due tipi di azione: <em>Azioni Base</em> ed <em>Abilità</em>. Le <em>azioni base</em> sono in genere disponibili ad ogni personaggio e possono essere usate a piacere. Le abilità sono specifiche per alcuni personaggi e possono avere dei tempi di <em>cooldown</em>.</p>
        
        <h2>Cooldown</h2>
        <p>Il <em>cooldown</em> è il numero di <em>turni</em> minimo tra due utilizzi di una stessa <em>abilità</em>.</p>
        
        <h2>Turno</h2>
        <p>Un <em>turno</em> si conclude quando tutti i partecipanti alla scena hanno esaurito i propri <em>punti azione</em>. Tutti gli effetti collaterali si risolvono alla fine del turno.</p>
      </section>
      <section class="skill-list" id="skill-list">
        <h1>
          Abilità
        </h1>
        <div 
          v-for="(group, i) in $options.skills"
          class="skill-group-compact"
          :id="`skills-level-${i + 1}`">
          <h2>Livello {{ i + 1 }}</h2>
          <skill 
            v-for="skill in group"
            :selectedSkill="selectedSkill"
            :skill="skill"
            :compact="true" 
            @click="selectSkill"
          />
        </div>
      </section>
      <section class="talent-list" id="talent-list">
        <h1>Talenti</h1>
        <ul>
          <li v-for="talent in $options.talents">
            <card>
              <span slot="header-main" :id="`talent-${talent.id}`">
                <div class="icon-container-inner">
                  <img
                    class="skill-icon"
                    :src="`src/assets/images/skills-icons/${talent.icon}.png`"
                    :alt="`${talent.name} icon`" />
                </div>
                
                <span>{{ talent.name }}</span>
              </span>
              
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt vero ad eius, sed temporibus porro. Sapiente dolore, sequi ad, nam expedita ea ullam labore vitae molestias iure delectus laborum aliquid.</p>
            </card>
            
          </li>
        </ul>
      </section>
      <section class="equipment" id="equipment">
        <h1>Equipaggiamento ed Oggetti</h1>
        <section class="weapons" id="weapon-list">
          <h2>Armi</h2>
          <ul class="weapon-list">
            <li v-for="weapon in $options.equipment.weapons">
              <weapon-card :weapon="weapon" />
            </li>
          </ul>
        </section>
        <section class="armors" id="armor-list">
          <h2>Armature</h2>
          <ul class="armor-list">
            <li v-for="armor in $options.equipment.armors">
              <card>
                <span slot="header-main">
                  {{ armor.type }}

                  <ul class="armor-stats attribute-modifiers">
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">{{ armor.cost }}</span>
                    </li>
                  </ul>
                </span>

                <p v-if="armor.description" v-html="armor.description"></p>

                <attribute-modifiers 
                  slot="footer"
                  v-if="armor.modifiers"
                  :modifiers="armor.modifiers"
                />
              </card>
            </li>
          </ul>
        </section>
        <section class="items" id="item-list">
          <h2>Oggetti</h2>
          <ul class="item-list" v-for="category in $options.equipment.items">
            <li v-for="item in category">
              <card>
                <span slot="header-main">
                  {{ item.type }}

                  <ul class="armor-stats attribute-modifiers">
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">{{ item.cost }}</span>
                    </li>
                  </ul>
                </span>

                <p v-if="item.description" v-html="item.description"></p>

                <attribute-modifiers 
                  slot="footer"
                  v-if="item.modifiers"
                  :modifiers="item.modifiers"
                />
              </card>
            </li>
          </ul>
        </section>
      </section>
    </div>
  </div>
</template>

<script>
import groupBy from "lodash.groupby";
import AttributeModifiers from "./components/AttributeModifiers.vue";
import Card from "./components/Card.vue";
import Skill from "./components/Skill.vue";
import WeaponCard from "./components/WeaponCard.vue";

import equipment from "../../../../src/assets/script/modules/equipment.json";
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
    AttributeModifiers,
    Card,
    Skill,
    WeaponCard
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
  
  equipment: {
    armors: equipment.armors,
    items: groupBy(equipment.items, "category"),
    weapons: equipment.weapons
  },
  skills: groupedSkills,
  talents: skills.talents
}
</script>

<style lang="scss">
  @import "../style/core";
  
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: $blue-color;
    font-weight: 300;
    margin: $line-height 0;
  }
  
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
    color: $yellow-color;
    
    &.minus,
    &.plus,
    &.stat {
      font-style: normal;
    }
    
    &.minus {
      color: $red-color;
    }
    
    &.plus {
      color: $green-color;
    }
    
    &.stat {
      color: $aqua-color;
    }
  }
  
  h1 {
    margin: $line-height * 2 0;
  }
  
  ul {
    padding: 0;
    margin: $line-height 0;
    list-style-type: none;
    
    ul {
      margin: 0;
      padding: 0;
    }
  }

  .armor-list,
  .item-list {
    .card-header-main .attribute-modifiers {
      right: $padding;
    }
  }
  
  .attribute-list {
    em {
      font-style:  normal;
      font-weight: bold;
    }
    
    .material-icons {
      color: $yellow-color;
      margin-right: $padding;
      vertical-align: middle;
    }
  }
  
  .card-header-main {
    .attribute-modifiers {
      color:       $gray-color-light;
      display:     inline-block;
      font-size:   $unit-4;
      margin-left: $padding * 2;
      position:    absolute;
      top:         0;
      right:       $padding * 11;

      .modifier {
        line-height: $line-height * 2;
        height:      $line-height * 2;
      }

      .weapon-damage {
        width: $padding * 4;
      }
    }
  }
  
  .logo {
    margin-bottom: $line-height;
    width:         150px;
  }
  
  .off-canvas {
    .book-content {
      padding-right: 4rem;
      max-width:     960px;
    }
    .off-canvas-sidebar {
      background-color: $dark-color-darker;
      min-width:        12rem;
      padding:          $padding;
    }
  }
  
  .skill-group {
    margin: $line-height 0;
  }
  
  .table-of-contents {
    font-weight:    bold;
    text-align:     center;
    text-transform: uppercase;
    position:       fixed;
    top:            $line-height;
    
    > ul {
      text-align: left;
      
      > li {
        margin-bottom: $line-height;
        
        > ul {
          font-weight:    normal;
          padding-left:   $padding;
          text-transform: none;
          
          > li {
            
          }
        }
      }
    }
    
    a {
      color: $gray-color-light;
      
      &:hover {
        color: $blue-color;
        border: 0;
      }
    }
    
    ul {
      font-size: $unit-3;
      list-style-type: none;
      margin-top:      $line-height;
    }
  }
  
  .tooltip {
    cursor: help;
  }
</style>