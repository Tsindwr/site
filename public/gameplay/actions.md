---
aliases:
  - General Actions
  - Movement
  - Attack
  - Action Tests
---

# Actions in Sunder

Every player starts out with a set of General **Action Cards**. These are [[scenes|Abilities]] all characters have, and can take as their Action during [[scenes|Initiative]].

An Action during [[scenes|Initiative]] involves the playing of two cards: one on its Attack side, and one on its Movement side. A player is not able to play two Attack cards for their action, nor are they able to play two Movement cards. Each **Action Card** has an Attack and Movement side, but the two cannot be activated at the same time, since the player must play two cards per turn.

A player may choose to forgo the defined Attack or Movement on an **Action Card** and instead use the default action. The default Attack Action is "Make a weapon or unarmed\* attack (Force) against a Here target." The default Movement Action is "Move Close." 

A player will receive new **Action Cards** whenever they purchase the corresponding Ability from the [[experience-market|Experience Market]].

\* *Unarmed attacks deal damage to Might equal to your Tier.*

## Action Tests

If an Action requires a test from the character or its target, then the [[resolution-system|success levels]] are defined as follows:

- On a Test made by the character against the target, any Test that result in Mixed or higher is a success.
- On a Test made by the target to resist a character, any Test that does results in Success or higher is a success.
- Making a ranged attack at a target while a conscious adversary is within Here of you is considered to have Disadvantage.

## Modifiers

Ability Modifiers are measurements of an Ability's mechanical and narrative effects. These determine your character's special capabilities for interacting with this world, in a guaranteed or luck-based format. 

### Activating Abilities

Different abilities have different specifications for how they are activated, how often they can be activated, and under what conditions they can be activated. A lot of this can be measured by an ability's Reset Condition and Action Economy.

An ability's **Reset Condition** determines how often an ability can be activated once all of its uses have been expended. A Reset Condition of a **Long Rest** means an ability's uses replenish after completing a Long Rest. A Reset Condition of a **Short Rest** means an ability's uses replenish after completing a Short Rest. A Reset Condition of **Spell** means an ability must be preceded by a successful Test before the ability's effects can be activated again. A Reset Condition of **General** means an ability does apply an additional limit to how often it can be activated.

An ability's **Action Economy** determines what circumstances an ability can be activated under. This mostly refers to the time it takes to activate the ability. An Action Economy of **1 Action** means an ability can be activated on a turn during a scene by choosing it as one of the two Action Cards that define the turn. An Action Economy of **1 Group Action** means an ability can be activated by expending an Action Card of at least 2 distinct characters' turns. An Action Economy of **1 Minute** means a character must spend 1 Minute [[actions#Concentration|Concentrating]] on the activation of this ability, otherwise it does not successfully activate. An Action Economy of **Ritual** means a character must spend 1 Hour [[actions#Concentration|Concentrating]] on the activation of this ability, otherwise it does not successfully activate. An Action Economy of a **Surge** means an ability can be activated between turns, but cannot directly target any creature besides yourself. Surges can only be activated after all of the events that have been currently announced have narratively occurred. An Action Economy of a **Trait** gives a perpetual effect.

>[!important]+ The Narrative Power of Reactions
>Both Traits and any ability with a duration has the opportunity to provide a character with a Reaction. Reactions are the only type of Action Economy that can be narratively retroactive. Unlike Surges or Actions, which must occur narratively after all events that have been established already, Reactions can activate in the moments just before an announced event occurs in the narrative.

### Durations

When an Ability Card with a Duration has been played, and the Duration has not yet expired, the Ability Card is considered **Active**. Active Cards cannot be played again until the Duration expires, or until the owner of the Ability Card takes a Reaction to an event they can perceive to cut the duration short, unless otherwise specified.

Time Durations come in several different lengths: 1 round, 1 Scene, 1 Hour, Until Long Rest, and Until Dispelled. An ability activated with a duration of **1 round** that activates outside of the target's turn lasts until the end of the target's next turn, but if the effect activates during the target's turn, then it lasts until the beginning of the target's next turn. An ability with a duration of **1 Scene** lasts until the end of the narrative Scene, which could either be defined by a combat, whenever the narrative progresses naturally to a distinct situation, or approximately 1 minute in-game time. An ability with a duration of **1 Hour** lasts either for 1 hour in-game time, the duration of a span of travel, or during a rest's downtime moments. An ability with a duration of **Until Long Rest** lasts until you next begin a Long Rest. An ability with a duration of **Until Dispelled** lasts until successful action is taken by a creature or effect to specifically end the effect of this ability.
#### Concentration

If a duration requires Concentration, a character is considered to be Concentrating while the duration is active. A character can only be Concentrating on one effect at a time, unless otherwise specified. Concentration ends when a Concentrating character takes Fallout that results in a Stress refresh, or if the character ends the Concentration willingly. A Concentrating character may take a reaction in response to taking Fallout that would end their Concentration, and instead of losing Concentration, spend a Resistance in the Potential whose Stress has been reset.
### Distances

In Sunder, distances are defined in intervals, which are well-translated to theatre-of-the-mind gameplay, but still preserve a specific measurement. If something is defined to have a distance, then it can affect anywhere up to the value correlated to the named interval. To select a target within range, you must be able to see or otherwise sense the target.  
  
>[!info] Distance Interval Name  
>- **Here**: 5 feet (adjacent)  
>- **Near**: 10 feet  
>- **Close**: 30 feet  
>- **There**: 60 feet  
>- **Far**: 120 feet  
>- **Yonder**: >120 feet (Line of Sight)
## General Actions

<div class="gh-card-grid">
<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Strike</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Equip and use a tool or weapon to make a Test melee attack against a target.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Range - Here</span>
      </div>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Until the start of your next turn, reduce incoming Might Stress by your Might Volatility Die while armed. If unarmed, spend 1 Might Resistance to gain this benefit.
      </p>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Shift</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Move up to <em>Close</em>. This movement may pass through hostile spaces.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Range - Close</span>
      </div>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Retrieve, stow, or swap objects within <em>Here</em>.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Range - Here</span>
      </div>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Endure</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Once before the beginning of your next turn, you may expend a Nerve Resistance to succeed on a Test.
      </p>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Make a Grit or Frame Test to remove 1 Physical Stress.
      </p>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Adapt</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Spend a Stress in Seep to repeat a Test to resist an active Condition.
      </p>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Give a <em>Near</em> creature Advantage on a Test regarding a specified course of action.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Range - Near</span>
      </div>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Evade</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Until the start of your next turn, Tests made against you targeting Physical Potentials have Disadvantage.
      </p>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Attempt to break line of sight or avoid attention. Test Sleight or Aura: on a success, you are Unseen to creatures relying on sight.
      </p>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Manipulate</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Make a Risky interaction with a mundane object or mechanism.
      </p>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Search a creature or container with a Sense Test.
      </p>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Influence</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Make a Sway Test to influence a creature’s disposition. On a success, the target gains the Charmed condition and you gain a Beat. Spend 1 Heart Resistance to affect a Hostile creature.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Beat</span>
      </div>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Make a Hope or Anchor Test to remove 1 Mental Stress from yourself or an ally within <em>Here</em>.
      </p>

      <div class="gh-runes">
        <span class="gh-rune"><span class="gh-dot"></span>Range - Here</span>
      </div>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Spin</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Make a Weave or Esoterica Test to interact with an active Dwoemer or Binding.
      </p>
    </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Center your mind against Warp and the Arcane. Until the start of your next turn, you have Advantage on Tests made to resist Magick effects targeting Mental Potentials.
      </p>
    </div>
  </section>

  <div class="gh-cut"></div>
</div>

<div class="gh-card" role="group" aria-label="Action Card">
  <div class="gh-head">
    <div class="gh-stamp">Cost —</div>
    <h3 class="gh-title">Narrate</h3>
    <p class="gh-sub">General Action</p>
  </div>

  <!-- TOP HALF -->
  <section class="gh-half top">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="attack">⚔</div>
    </div>

    <div>
      <p class="gh-label">Attack</p>
      <p class="gh-text">
        Play this Action when you are making a Group Action with allies on the same turn. When you play this Action, you cannot take an Indirect/Movement Action on the same turn. This counts as adding 1 person to the Group Action.
      </p>
      </div>
  </section>

  <!-- BOTTOM HALF -->
  <section class="gh-half bottom">
    <div class="gh-rail" aria-hidden="true">
      <div class="gh-pip" data-tone="move">↯</div>
    </div>

    <div>
      <p class="gh-label">Movement</p>
      <p class="gh-text">
        Spend Flavor Tokens to activate a Flavor Ability.
      </p>
      </div>
  </section>

  <div class="gh-cut"></div>
</div>
</div>

