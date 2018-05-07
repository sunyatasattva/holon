<template>
  <div ref="main" class="off-canvas off-canvas-sidebar-show">
    <div class="off-canvas-sidebar">
      <nav class="table-of-contents">
        <img src="src/assets/images/logo.png" alt="Holon RPG" class="logo">

        <span class="version-number">2.0.0-beta.3</span>
        
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
            <a href="#section-status-conditions">Condizioni alterate</a>
          </li>
          <li>
            <a href="#section-base-actions">Azioni base</a>
          </li>
          <li>
            <a href="#section-skills">Abilità</a>
          </li>
          <li>
            <a href="#talent-list">Talenti</a>
          </li>
          <li>
            <a href="#section-resources">Risorse</a>

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
              <li>
                <a href="#section-cyberware-and-bioware">Cyberware e Bioware</a>
              </li>
              <li>
                <a href="#section-immortality-protocol">Protocollo dell'Immortalità</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
    <div class="off-canvas-content book-content">
      <section id="section-attributes">
        <h1>Attributi</h1>
        <p>Ogni personaggio possiede {{ $options.mechanics.attributes.length }} <em>Attributi</em>:</p>
        <ul class="attribute-list">
          <li v-for="attribute in $options.mechanics.attributes">
            <p>
              <i class="material-icons">{{ attribute.icon }}</i>
              <span v-html="attribute.description"></span>
            </p>
          </li>
        </ul>
      </section>
      <section id="section-character-creation">
        <h1>Creazione del personaggio</h1>
        <p>Alla creazione, un personaggio ottiene <em class="stat">200 Punti Esperienza</em> che può distribuire ai valori dei suoi <em>Attributi</em> o utilizzare per acquisire <em><a href="#skill-list">Abilità</a></em>, un numero di <em class="stat">Punti Risorse</em> pari a <em class="stat">15</em> + il doppio del suo punteggio di <em>Risorse</em> che può spendere in <a href="#section-resources">equipaggiamento ed oggetti</a>, un <em>Talento</em> primario (a <em class="stat">livello di competenza 2</em>), ed uno secondario (a <em class="stat">livello di competenza 1</em>).</p>
        <p>Ogni <em>Attributo</em> ha un valore iniziale di base che può essere aumentato ad un costo per punto che aumenta proporzionalmente al punteggio. Il costo effettivo di ogni punto viene calcolato in questo modo:</p>
        <ol>
          <li>Se il punto da acquisire è minore del valore di <em>cap</em> dell'<em>Attributo</em>, allora il costo è semplicemente quello indicato.</li>
          <li>Altrimenti, il costo aumenta aritmeticamente per ogni incremento di <em>step</em>.</li>
        </ol>
        <p>
          <md-button
            class="md-raised md-primary"
            @click="showCharacterCreator = true"
          >
            <i class="material-icons">share</i>
            <span>Assegna Punti Esperienza iniziali</span>
          </md-button>
        </p>
        <div class="modal" :class="{ 'active': showCharacterCreator }">
          <div 
            class="modal-overlay"
            @click="showCharacterCreator = false"></div>
          <div class="modal-container">
           <div class="modal-header">
             <a 
               class="btn btn-clear float-right" 
               aria-label="Chiudi"
               @click="showCharacterCreator = false"
             ></a>
             <h2 class="modal-title">Assegnazione punti esperienza</h2>
           </div>
           <div class="modal-body">
             <div class="content">
               <table class="table attributes-costs">
                <tr>
                  <th>
                    <md-chip>{{ availableCharacterPoints }}</md-chip>
                  </th>
                  <th>Iniziale</th>
                  <th>Costo</th>
                  <th>Cap</th>
                  <th>Step</th>
                </tr>
                <tr v-for="(attribute, i) in $options.mechanics.attributes">
                  <td>
                    <attribute-input
                      :max="availableCharacterPoints <= 0 ? attributes[i].value : 255"
                      :icon="attribute.icon"
                      :label="attribute.name"
                      :min="attribute.initial"
                      :cap="attribute.cap"
                      :cost="attribute.cost"
                      :initial="attribute.initial"
                      :step="attribute.step"
                      :model.sync="attributes[i]"
                    />
                  </td>
                  <td>{{ attribute.initial }}</td>
                  <td>{{ attribute.cost }}</td>
                  <td>{{ attribute.cap }}</td>
                  <td>{{ attribute.step }}</td>
                </tr>
              </table>
             </div>
           </div>
          </div>
        </div>
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
        
        <h2>Tipologie di danni</h2>
        <h3>Danni penetranti</h3>
        <p>I <em>danni penetranti</em> ignorano la <em>Robustezza</em> del bersaglio.</p>
        <h3>Danni perforanti</h3>
        <p>I <em>danni perforanti</em> danneggiano le <em>armature</em> permanentemente, diminuendone il bonus alla <em>Robustezza</em>. Nel caso di <em>Robustezza</em> naturale, la danneggiano per <em class="stat">3 turni</em>.</p>
        
        <h2>Schivata</h2>
        <p>Per ogni <em class="stat">10 punti</em> (arrotondati per difetto) in <em>Riflessi</em>, il personaggio ottiene <em class="stat">1 punto</em> in <em>Schivata</em>.</p>
        <p>Questi punti si sottraggono alla probabilità di <em>successo critico</em> di un avversario che ha come bersaglio il personaggio.</p>
        <p>Se il punteggio di <em>Schivata</em> del bersaglio è maggiore della probabilità di <em>successo critico</em> dell'attaccante, la differenza rappresenta la <em>probabilità di schivare</em>; la meccanica è identica a quella dei <em>risultati critici</em>: se l'unità della prova è minore o uguale alla <em>probabilità di schivare</em>, l'attacco si considera <em>schivato</em>.</p>
        <p>Un attacco <em>schivato</em> <em class="plus">riduce di 1 livello</em> il successo della prova: sarebbe a dire, un successo normale diviene un <em>successo marginale</em>, ed un <em>successo marginale</em> diviene un fallimento.</p>
        
        <h2>Coperture</h2>
        <p>Esistono due tipi di <em>coperture</em>: <em>copertura parziale</em> e <em>copertura totale</em>. La prima conferisce un <em class="plus">bonus di +20</em> alla <em>Difesa</em>, la seconda un <em class="plus">bonus di +40</em>.</p>
        <p>Un <em>difensore</em> si trova <em class="stat">in copertura</em> rispetto ad un determinato <em>attaccante</em>, se, al momento dell'<em>Attacco</em>, questi si trova subito dietro una <em>copertura</em> ed un piano proiettato da questa interseca la <em>linea visiva</em> dell'<em>Attaccante</em>.</p>
        <p>Un <em>Attacco</em> contro un bersaglio <em class="stat">esposto</em> (non in <em>copertura</em>), ottiene un <em class="plus">bonus di +3</em> alla <em>possibilità di successo critico</em>.</p>
        
        <h2>Ferite</h2>
        <p>Un personaggio può subire un numero di <em>ferite</em> pari al proprio valore di <em>Resistenza</em> prima di rischiare la vita. Ogni <em>ferita</em> subita, conferisce al personaggio una <em class="minus">penalità di 5 punti</em> a tutte le <em>prove</em>.</p>
        <p>Esaurita la <em>Resistenza</em> un personaggio cade privo di sensi. Un personaggio che esaurisce la <em>Resistenza</em> per via di un <em>successo critico</em> o che riceve un numero di <em>danni</em> pari o superiori alla sua <em>Resistenza</em> in un sol colpo, muore istantaneamente.</p>
        <p>Altrimenti, il personaggio sopravvive ed inizia a perdere sangue. Un personaggio può perdere sangue per un numero di turni pari al proprio punteggio di <em>Resistenza</em> prima di perdere la vita.</p>
        
        <h2>Punti azione</h2>
        <p>Ogni personaggio ha un numero finito di <em>punti azione</em> pari al proprio punteggio di <em>Azione</em>; ogni azione usa un numero di predefinito di questi punti. Una volta esauriti questi punti, il <em>turno del personaggio</em> finisce ed egli non può agire più fino al <em>turno successivo</em>.</p>
        
        <h2>Azioni</h2>
        <p>Ogni azione costa un determinato numero di <em>punti azione</em>, certe <em>azioni</em> terminano il turno indipendentemente dal numero di punti azione rimanenti (queste azioni sono indicate in <span class="ends-turn">arancione</span> nel loro costo in punti azione).</p>

        <p>Vi sono due tipi di azione: <em>Azioni Base</em> ed <em>Abilità</em>. Le <em>azioni base</em> sono in genere disponibili ad ogni personaggio e possono essere usate a piacere. Le abilità sono specifiche per alcuni personaggi e possono avere dei tempi di <em>cooldown</em>.</p>
        
        <h2>Cooldown</h2>
        <p>Il <em>cooldown</em> è il numero di <em>turni</em> minimo tra due utilizzi di una stessa <em>abilità</em>.</p>
        
        <h2>Turno</h2>
        <p>Un <em>turno</em> si conclude quando tutti i partecipanti alla scena hanno esaurito i propri <em>punti azione</em>. Tutti gli effetti collaterali si risolvono alla fine del turno.</p>
      </section>
      <section id="section-status-conditions">
        <h1>Condizioni alterate</h1>
        <p>Un personaggio può subire degli effetti, dall'ambiente, da oggetti o da altre cause, che ne alterano la condizione. Generalmente questi effetti hanno una <em>durata</em> in termini di <em>turni</em> che è specificata nella fonte dell'effetto in questione. Alcuni oggetti o azioni possono ridurre o rimuovere questa alterazione.</p>
        <ul>
          <li class="status-condition" v-for="status in $options.mechanics.statii">
            <card>
              <div slot="header-main">
                <div class="icon-container-inner">
                  <i class="material-icons status-icon">
                    {{ status.icon }}
                  </i>
                </div>
                {{ status.name }}
              </div>
              
              <div v-html="status.description"></div>
              
              <attribute-modifiers 
                slot="footer"
                v-if="status.modifiers"
                :modifiers="status.modifiers"
              />
            </card>
          </li>
        </ul>
      </section>
      <section id="section-base-actions">
        <h1>Azioni base</h1>
        <ul class="ability-list">
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-move.png" />
                </div>
               
                Muoversi

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                Un personaggio può <em>muoversi</em> per un numero di metri pari al suo <em>Movimento</em>. Un personaggio che spende almeno <em class="stat">2 PA</em> in un <em>turno</em> in questa azione, ottiene <em class="plus">un bonus di 20 punti</em> alla <em>Difesa</em> contro <em>Sorvegliare</em>.
              </p>
            </card>
          </li>
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-attack.png" />
                </div>
               
                Attaccare

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip ends-turn"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                Un personaggio può utilizzare la proprio arma per eseguire un <em>attacco</em>. Per usare un’arma a distanza deve avere sufficienti munizioni ed il bersaglio deve trovarsi ad almeno <em class="stat">2 metri di distanza</em>. Armi in mischia possono attaccare entro <em class="stat">1 metro di distanza</em> (anche in diagonale).
              </p>
              <p>
                Le armi a distanza possono colpire fino ad un raggio massimo pari al punteggio di <em>Visione</em>, tranne dove diversamente specificato.
              </p>
              
              <div slot="footer">
                <span 
                   class="side-effect tooltip tooltip-left"
                   data-tooltip="Fallimento critico">
                  <i class="material-icons minus">new_releases</i>
                  <span>L'arma si inceppa e richiede un'azione di <em>Utilizzare Oggetti (Ricaricare)</em> per essere utilizzata nuovamente.</span>
                </span>
                <span 
                   class="side-effect tooltip tooltip-left"
                   data-tooltip="Successo critico">
                  <i class="material-icons plus">new_releases</i>
                  <span>L'attacco infligge <em class="plus">1.5&times;</em> danni.</span>
                </span>
                <span 
                   class="side-effect tooltip tooltip-left"
                   data-tooltip="Fallimento/Successo marginale">
                  <i class="material-icons">error_outline</i>
                  <span>L'attacco infligge <em class="minus">la metà</em> dei danni.</span>
                </span>
              </div>
            </card>
          </li>
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-overwatch.png" />
                </div>
               
                Sorvegliare

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                Un personaggio può coprire un’area semicircolare pari al suo punteggio di <em>Visione</em> o pari alla gittata della sua arma, quale che sia maggiore. Il personaggio eseguirà un’azione di <em>Reazione</em> con <em class="minus">una penalità di -20</em> verso il primo bersaglio ostile che si muove entro questo raggio e non usufruisce di <em>Copertura totale</em>. Questi attacchi non possono effettuare <em>successi critici</em>.
              </p>
              <p>
                Tranne quando diversamente specificato, una <em>Reazione</em> consiste in un <em>Attacco</em>.
              </p>
              <p>
                <em>Sorvegliare</em> dura fino al prossimo <em>punto azione</em> speso dal personaggio.
              </p>
            </card>
          </li>
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-hunkerdown.png" />
                </div>
                
                Accovacciarsi

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip ends-turn"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                Un personaggio che esegue questa azione <em class="minus">dimezza il suo punteggio</em> di <em>Visibilità</em> e <em>Movimento</em>, subisce <em class="minus">una penalità di -20</em> alla <em>Mira</em>, ma <em class="plus">raddoppia il suo bonus</em> di <em>Copertura</em>. Dura fino all’inizio del prossimo <em>turno</em> del personaggio.
              </p>
            </card>
          </li>
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-stabilize.png" />
                </div>
                
                Stabilizzare l'arma

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip ends-turn"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                <em>Stabilizzare l’arma</em> conferisce <em class="plus">un bonus di +20</em> alla <em>Mira</em> del personaggio per il <em>punto azione</em> successivo.
              </p>
            </card>
          </li>
          <li>
            <card>
              <span slot="header-main">
                <div class="icon-container-inner">
                  <img 
                    class="skill-icon"
                    src="src/assets/images/skills-icons/ico-base-useitem.png" />
                </div>
                
                Utilizzare oggetti

                <ul class="attribute-modifiers">
                  <li
                    class="modifier tooltip ends-turn"
                    data-tooltip="Punti azione">
                    <i class="material-icons">reply_all</i>
                    1    
                  </li>
                </ul>
              </span>
              
              <p>
                Il personaggio può utilizzare un oggetto dal suo inventario, o affidare un oggetto ad un bersaglio alleato entro <em>Visione</em>.
              </p>
              <p>
                Un personaggio può usare questa azione per <em>Estrarre</em> o <em>Ricaricare</em> la propria arma. In tal caso, l'azione non termina il turno.
              </p>
            </card>
          </li>
        </ul>
      </section>
      <section class="skill-list" id="section-skills">
        <h1>
          <span>Abilità</span>
          <div class="view-options">
            <input type="radio" id="compactAbilities-compact" name="compactAbilities" :value=true v-model="compactAbilities">
            <label for="compactAbilities-compact">
              <i class="material-icons">view_comfy</i>
            </label>
            <input type="radio" id="compactAbilities-expanded" name="compactAbilities" :value=false v-model="compactAbilities">
            <label for="compactAbilities-expanded">
              <i class="material-icons">view_list</i>
            </label>
          </div>
        </h1>
        <p>Un personaggio può utilizzare <em>punti esperienza</em> per acquistare permanentemente <em>abilità</em>. Il costo di ognuna di queste dipende dal <em class="stat">livello</em>, e questo dipende dai <em class="stat">requisiti</em> che devono essere soddisfatti per acquisirla.</p>
        <p>Per ogni <em>abilità</em> dello stesso <em class="stat">livello</em>, il costo aumenta in maniera aritmetica.</p>
        <div 
          v-for="(group, i) in $options.groupedSkills"
          class="skill-group-compact"
          :id="`skills-level-${i + 1}`">
          <h2>Livello {{ i + 1 }}</h2>
          <skill-card
            v-for="skill in group"
            :skill="skill"
            :compact="compactAbilities"
          />
        </div>
      </section>
      <section class="talent-list" id="talent-list">
        <h1>Talenti</h1>
        <p>I <em>Talenti</em> rappresentano i dominî di competenza nei quali un personaggio possiede maestria ottenuta attraverso formazione e pratica.</p>
        <p>Queste competenze determinano in che modo il personaggio può agire efficacemente nel mondo: se un personaggio non possiede alcuna competenza in un determinato campo, non può in genere tentare di interagire con quel campo (un personaggio che non possiede competenze di <em>Atletica</em> non può tentare di scalare una parete rocciosa).</p>
        <p>In caso contrario, il personaggio può effettuare una <em>Prova di Focus</em> per ottenere il risultato che desidera, con dei modificatori appropriati per la situazione (es. il personaggio non ha tempo per concentrarsi, è il suo primo tentativo in qualcosa di completamente nuovo, non ha attrezzi adatti etc.).</p>
        <p>Ogni <em>Talento</em> ha tre livelli di competenza: al <em class="stat">primo</em>, il personaggio è un professionista del settore; al <em class="stat">secondo</em>, il personaggio è un'autorità del settore (ed ottiene <em class="plus">un bonus di +15</em> alle <em>prove</em>); al <em class="stat">terzo</em>, è maestro assoluto in quel campo (ed ottiene <em class="plus">un bonus di +30</em> alle <em>prove</em>).</p>
        <p>Personaggi con competenze nel medesimo settore, possono collaborare e conferirsi vicendevolmente dei <em class="plus">bonus</em> alla <em>prova</em>.</p>
        <ul>
          <li v-for="talent in $options.talents">
            <card>
              <div slot="header-main" :id="`talent-${talent.id}`">
                <div class="icon-container-inner">
                  <img
                    class="skill-icon"
                    :src="`src/assets/images/skills-icons/${talent.icon}.png`"
                    :alt="`${talent.name} icon`" />
                </div>
                
                <span>{{ talent.name }}</span>
              </div>
              
              <div v-html="talent.description"></div>
              
              <div slot="footer">
                <skill-card 
                  v-for="skill in 
                    $options.skills.filter( skill => skill.requirements.some( requirement => requirement === `talent-${talent.id}` ) )"
                  :skill="skill"
                  :compact="true"
                />
              </div>
            </card>
            
          </li>
        </ul>
      </section>
      <section class="equipment" id="section-resources">
        <h1>Risorse</h1>
        <p>Ogni personaggio ha un punteggio di <em>Risorse</em> che rappresenta il suo capitale economico e materiale, nonché la capacità di procurarsi ciò che si desira con altri mezzi non convenzionali.</p>
        <p>In determinate <em>situazioni di ristoro</em> decise dal <em>GM</em>, un personaggio può procurarsi equipaggiamento, oggetti ed altre risorse materiali in misura uguale all'interezza del suo punteggio di <em>Risorse</em>.</p>
        <p>Un personaggio può decidere di <em class="minus">spendere permanentemente</em> <em class="stat">3 di questi punti</em> per crearsi una <em>situazione di ristoro</em>. La situazione deve essere comunque vagamente ragionevole, ed il <em>GM</em> può sempre decidere quali beni sono acquistabili ad ogni situazione.</p>
        <h2>Accumulare risorse</h2>
        <p>Ad ogni <em>situazione di ristoro</em> un personaggio può decidere di conservare fino alla metà del proprio punteggio di <em>Risorse</em> per spenderlo in situazioni successive.</p>
        <h2>Risorse bloccate</h2>
        <p>In alcuni casi, come per l'acquisto di servizi su base continua, il <em>GM</em> può decretare che un certo numero di <em>Risorse</em> siano bloccate: in tal caso, il punteggio non cambia, ma queste non possono essere usate fin tanto che rimangono <em>bloccate</em>.</p>
        <p>Il costo di questi servizi viene indicato in <span class="ongoing-service">arancione</span>.</p>
        <h2>Debiti</h2>
        <p>Un personaggio può <em>indebitarsi</em> di un numero di <em>Risorse</em> pari al suo punteggio completo. In tal caso, il personaggio <em class="minus">perde permanentemente</em> <em class="stat">1 di questi punti</em> e le sue risorse rimangono <em>bloccate</em> per le prossime due <em>situazioni di ristoro</em>.</p>
        <h1>Equipaggiamento</h1>
        <p>Armi ed armature possono avere un numero variabile di <em>slot</em> nei quali possono essere installati dei <em>moduli</em> che ne modificano alcune caratteristiche: una volta installati, questi moduli non possono essere disinstallati senza danneggiare l'arma o il modulo, a meno che non si possegga <em class="stat">Ingegneria 2</em>.</p>
        <p>Solo un <em>modulo</em> per ogni tipo può essere installato in un'arma.</p>
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
                  <span class="icon-container-inner">
                    <component 
                      :is="`icon-${$options.itemIcons[item.category]}`" />
                  </span>
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
        <section class="items" id="section-cyberware-and-bioware">
          <h2>Cyberware e Bioware</h2>
          <p>È possibile potenziare il proprio corpo attraverso impianti neurali (<em>Cyberware</em>) e modifiche genetiche o impianti biologici (<em>Bioware</em>). Questi potenziamenti rimangono installati sul personaggio permanentemente, richiedono uno specialista con almeno <em class="stat">Medicina 2</em> per essere installati e <em class="stat">Medicina 3</em> per essere rimossi senza uccidere il personaggio.</p>
          <p>In caso di morte, il corpo viene replicato con il <em>Bioware</em> appropriato, ma il <em>Cyberware</em> deve essere disinstallato e reinstallato nel nuovo corpo.</p>
          <h3>Cyberware</h3>
          <p>Ogni impianto neurale conferisce una <em class="minus">penalità</em> al <em>Focus</em> del personaggio.</p>
          <p>Di norma, gli effetti del <em>Cyberware</em> sono sempre attivi; alcuni effetti, potrebbero richiedere l'attivazione conscia del personaggio attraverso un'<em>Azione</em> od avere un <em>Cooldown</em>, come specificato nella descrizione dalle apposite icone (<i class="material-icons">reply_all</i> e <i class="material-icons">settings_backup_restore</i>).</p>
          <ul class="item-list">
            <li v-for="item in $options.equipment.augmentations.cyberware">
              <card>
                <span slot="header-main">
                  <span class="icon-container-inner">
                    <component 
                      :is="`icon-${$options.itemIcons[item.category]}`" />
                  </span>
                  {{ item.type }}

                  <ul class="armor-stats attribute-modifiers">
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">{{ item.cost }}</span>
                    </li>
                    <li 
                     class="modifier tooltip" 
                     data-tooltip="Focus">
                      <i class="material-icons">brightness_7</i>
                      <span class="modifier-value">{{ item.focus }}</span>
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
          <h3>Bioware</h3>
          <p>Oltre ad eventuali effetti sempre attivi, in molti casi un <em>Bioware</em> ha un effetto supplementare che può essere attivato ad un costo in <em>Ferite</em>. Tranne dove diversamente specificato, l'attivazione non richiede un'<em>Azione</em> e non ha <em>Cooldown</em>.</p>
          <ul class="item-list">
            <li v-for="item in $options.equipment.augmentations.bioware">
              <card>
                <span slot="header-main">
                  <span class="icon-container-inner">
                    <component 
                      :is="`icon-${$options.itemIcons[item.category]}`" />
                  </span>
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
                
                <div v-if="item.description" v-html="item.description"></div>

                <attribute-modifiers 
                  slot="footer"
                  v-if="item.modifiers"
                  :modifiers="item.modifiers"
                />
              </card>
            </li>
          </ul>
        </section>
        <section id="section-immortality-protocol">
          <h2>Protocollo dell'Immortalità</h2>
          <p>Un personaggio che <em>muore</em> può essere <em>resuscitato</em> attraverso il <em class="stat">Protocollo dell'Immortalità</em>, ma la resurrezione non arriva senza effetti collaterali:</p>
          <ol>
            <li>
              Se il corpo del personaggio ed il <em class="stat">Protocollo dell'Immortalità</em> sono recuperabili, il personaggio può essere <em>resuscitato</em> in una <em class="stat">Clinica di Resurrezione</em>, ma le sue <em>Risorse</em> saranno <em>bloccate</em> per una <em>situazione di ristoro</em>.
            </li>
            <li>
              Se il <em class="stat">Protocollo dell'Immortalità</em> è recuperabile, ma il corpo è in condizioni irrimediabili, si applicano le conseguenze del punto 1, ed in più il personaggio <em class="minus">perde permanentemente</em> <em class="stat">5 punti</em> <em>Risorse</em>.
            </li>
            <li>
              Se il <em class="stat">Protocollo dell'Immortalità</em> non è recuperabile, il personaggio può essere <em>resuscitato</em> da un <em>backup</em>, ammesso che lo abbia. In quel caso si applicano tutte le conseguenze del punto 2, ed in più il personaggio <em class="minus">perde qualsiasi punto esperienza</em> acquisito dall'ultimo <em>backup</em>.
            </li>
          </ol>
          <ul class="immortality-services">
            <li>
              <card>
                <span slot="header-main">
                  Assicurazione Immortalità

                  <ul class="attribute-modifiers">
                    <li 
                     class="modifier tooltip ongoing-service" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">4</span>
                    </li>
                  </ul>
                </span>

                <p>Un personaggio assicurato non ha alcun effetto negativo sulle <em>Risorse</em> a seguito di una <em>resurrezione</em>.</p>
              </card>
              <card>
                <span slot="header-main">
                  Backup

                  <ul class="attribute-modifiers">
                    <li 
                     class="modifier tooltip ongoing-service" 
                     data-tooltip="Costo">
                      <i class="material-icons">monetization_on</i>
                      <span class="modifier-value">2</span>
                    </li>
                  </ul>
                </span>

                <p>Un personaggio effettua un <em>backup</em> della propria coscienza ad ogni <em>situazione di ristoro</em>.</p>
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
import SkillCard from "./components/SkillCard.vue";
import WeaponCard from "./components/WeaponCard.vue";

import AttributeInput from "../../../../src/assets/script/components/AttributeInput.vue";
  
import equipment from "../../../rules/equipment.json";
import mechanics from "../../../rules/mechanics.json";
import skills from "../../../rules/skills.json";

function parseRequirements(requirements, curr) {
  let nestedRequirements = [],
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
    
    try {
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);
    }
    catch(e) {
      console.warn(`No skill with id ${curr} has been found.`);
    }
    
    requirements = requirements.concat(nestedRequirements);
  }
  else if( Array.isArray(curr) ) {
    curr.forEach((option) => {
      skill = skills.skills.find(skill => skill.id === option);
      
      nestedRequirements = skill.requirements
        .reduce(parseRequirements, []);

      curr = curr.concat(nestedRequirements);
    });
  }
  
  return requirements;
} 

const groupedSkills = skills.skills
  .reduce((arr, skill) => {
    if( !skill.requirements.some( _ => _.includes("talent-") ) )
      arr.push(skill);
    
    return arr;
  }, [])
  .reduce((arr, skill) => {
    let requirementsLevel = skill.requirements
      .reduce(parseRequirements, []).length,
        group = arr[requirementsLevel] || [];
    
    group.push(skill);
    arr[requirementsLevel] = group;
    
    return arr;
  }, []);

  console.log(groupedSkills);
  
const ITEM_ICONS = {
  "Ammo": "ammo",
  "Cyberware": "memory",
  "Drugs": "pill",
  "Bioware": "dna",
  "Grenades": "ornament",
  "Weapon Mods": "pistol"
}

const STARTING_CHARACTER_POINTS = 200;
  
export default {
  name: "book",
  components: {
    AttributeInput,
    AttributeModifiers,
    Card,
    Skill,
    SkillCard,
    WeaponCard
  },
  computed: {
    availableCharacterPoints() {
      return STARTING_CHARACTER_POINTS - this.characterPoints;
    },
    characterPoints() {
      return this.attributes
        .reduce(
          (sum, curr) => sum + curr.cost,
          0
        );
    }
  },
  data() {
    return {
      attributes: mechanics.attributes
        .map( attr => ({ cost: 0, value: attr.initial }) ),
      compactAbilities: true,
      selectedSkill: {},
      showCharacterCreator: false
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
    augmentations: equipment.augmentations,
    items: groupBy(equipment.items, "category"),
    weapons: equipment.weapons
  },
  itemIcons: ITEM_ICONS,
  mechanics: mechanics,
  groupedSkills: groupedSkills,
  skills: skills.skills,
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
      text-decoration: none !important;
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
  }
  
  h1 {
    margin: $line-height * 2 0;
  }
  
  ul {
    padding: 0;
    margin: $line-height * 2 0;
    list-style-type: none;
    
    ul {
      margin: 0;
      padding: 0;
    }
  }

  .ability-list,
  .armor-list,
  .immortality-services,
  .item-list,
  .skill-list,
  .talent-list {
    .card-header-main .attribute-modifiers {
      right: $padding;
    }
  }
  
  .attributes-costs {
    td,
    th {
      text-align: center;
    }
    
    tr:nth-child(2n+1) {
      background-color: $dark-color;
      
      .md-field > .md-icon {
        &::after {
          background-color: $dark-color;
        }
      }
    }
    
    td {
      border:     0;
      
      &:first-child {
        width: 50%;
      }
    }
    
    
    .md-field {
      margin: 0;
      
      &::after {
        height: 0px;
      }
      
      .md-chip {
        margin-left: $padding / 2;
        position: relative;
        bottom: 4px;
      }
      
      .md-icon {
        bottom: 10px;
      }
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
  
  .ends-turn,
  .ongoing-service {
    color: $orange-color;
  }
  
  .h-card {
    .material-icons.status-icon {
      display:        inline-block;
      font-size:      24px;
      vertical-align: baseline;
    }
  }
  
  .logo {
    margin-bottom: $line-height;
    width:         150px;
  }
  
  .material-design-icon__svg {
    display:        inline-block;
    fill:           $blue-color;
    vertical-align: middle;
  }
  
  .material-icons {
    vertical-align: middle;
  }
  
  .md-field.md-theme-default > .md-icon::after {
    background-color: $dark-color-darker;
  }
  
  .md-primary {
    margin: $line-height 0;
    height: 48px;
    
    .md-button-content {
      padding: 10px;
    }
  }
  
  .md-theme-default :not(input):not(textarea)::selection {
    background-color: $purple-color;
  }
  
  .minus {
    color: $red-color;
  }
  
  .modal {
    &:target,
    &.active {
      .modal-overlay {
        background-color: rgba($dark-color-darker, 0.8);
      }
    }
    
    .modal-body {
      max-height: 85vh;
    }
    
    .modal-container {
      background-color: $dark-color-darker;
      box-shadow: 0 0.2rem 0.5rem rgba(#000, 0.6);
    }
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
  
  .plus {
    color: $green-color;
  }
  
  .side-effect {
    display: block;
    margin: 10px 0;
  }
    
  .stat {
    color: $aqua-color;
  }
  
  .status-condition {
    .h-card .icon-container-inner {
      line-height: 2rem;
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
      margin:     0;
      text-align: left;
      
      > li {
        margin-bottom: $line-height;
        
        > ul {
          font-weight:    normal;
          margin:         0;
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
  
  .version-number {
    display:        block;
    font-size:      0.5rem;
    font-weight:    normal;
    opacity:        0.7;
    text-transform: none;
  }
  
  .view-options {
    float:     right;
    font-size: 0;
    position: relative;
    top: 5px;
    
    input {
      display: none;
      
      &:checked + label {
        background-color: darken($blue-color, 15);
        box-shadow:       inset 0 0 5px darken($blue-color, 25);
      }
    }
    
    label {
      background-color: $blue-color;
      color:            $dark-color-darker;
      cursor:           pointer;
      display:          inline-block;
      padding:          5px;
      
      &:last-child {
        border-radius: 0 5px 5px 0;
      }
      
      &:nth-child(2) {
        border-radius: 5px 0 0 5px;
      }
    }
  }
</style>