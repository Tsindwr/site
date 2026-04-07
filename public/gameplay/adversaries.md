---
aliases:
  - monsters
---
# Monsters

When it comes to running [[scenes|Scenes]] as a Game Master, you don't always have the time to create characters or [[abilities#The Experience Market|Custom Abilities]] for every adversary your players come across. This calls for **Interventions**; **Interventions** allow adversaries to choose how adventurers' [[stress-and-fallout|Fallout]] manifests.

 The Game Master may interact with the Experience Market in a different way than players. This is to facilitate a sense of ease when creating the many adversaries characters will encounter throughout a campaign.

## Difficulty

To make a judgement about what your adventuring party can handle, calculate the average party Tier. To do this, take each character's Tier, add them together, and divide by the number of characters (rounded up) to get the average character Tier. Then, add the players' [[tokens|Party Level]].
$$
\left\lceil\frac{T_{\text{\:1st PC Tier}}\:+\:T_{\text{\:2nd PC Tier}}\:+\:...\:+\:T_{C\text{th PC Tier}}}{C_{\text{Number of characters}}}\right\rceil\:+\:P_{\text{\:Party Loom Level}}\:=\:D_{\text{\:Difficulty}}
$$
This results in a value called **Difficulty**. Difficulty can be spend in various ways, including the purchasing of Interventions.

Different levels of Interventions are associated with the different levels of Fallout. 

#### Intervention Trigger Table

| Fallout Type       | Difficulty Cost |
| ------------------ | --------------- |
| Mechanical Fallout | 1               |
| Minor Fallout      | 2               |
| Major Fallout      | 3               |
| Severe Fallout     | 4               |

Choosing an Intervention's Fallout Type determines what kind of Fallout the adversary is able to "intervene" upon. For example, say you have created an adversary with a Minor Fallout Intervention that causes the Muddled (N) Condition as alien paralytic excretions start to numb the player on contact. If a player would have a Stress Overflow due to an adversary's attack, and that Stress Overflow would result in Minor Fallout (see [[stress-and-fallout#Levels of Fallout|Levels of Fallout]]), then you may choose to immediately apply the adversary's Minor Fallout Intervention effect instead of coming up with an appropriate type of Fallout based on the narrative context. *Interventions cannot be activated on Fallout triggered by an Intervention.*

Additionally, Interventions can be used to define the outcome of Narrative and [[stress-and-fallout|Situational Fallout]]. This oftentimes occurs when a player rolls a Test that results in Mixed or lower. Different kinds of Interventions can affect different success levels that would incur Fallout (see below).

| Success Level | Intervention Level |
| ------------- | ------------------ |
| Mixed         | Mechanical         |
| Failure       | Minor              |
| Miff          | Major              |
| Natural Miff  | Severe             |
\* Certain Interventions could be given increased durations to accommodate for higher levels of Fallout than what an adversary's Interventions cover. This only applies to Interventions that inflict a Condition, and is up to GM discretion.

The Difficulty of an adversary manifests in its ability to increase the Fallout Level taken by a target creature, though the effect is restricted to what is predetermined in the definition of that adversary's Intervention. To increase the Fallout Level, the original Fallout Level must be Narrative, Minor, or Major, and the adversary must succeed on a Test determined in the Intervention's definition. Increasing the Fallout Level taken by a target creature causes the GM to skip their next turn.

### Intervention Templates

Different levels of Interventions call for different effects, which can vary per the adversary's narrative capabilities. Here are a list of potential Intervention effects that correspond with their Fallout Types:

<h4>Mechanical Interventions</h4>
- Apply Disadvantage on the target's next Test in a specific Skill.
- Grant Advantage on the next attack against the target.
<h4>Minor Interventions</h4>
- Apply a Minor Condition to the target until the beginning of the adversary's next turn.
- Apply 1DV Equipment Damage to a target's equipped item.
- Prevent the Stress Track from overflowing, and instead move the overflow Stress to another specific Potential Track.
<h4>Major Interventions</h4>
- Apply a Minor Condition to the target until the end of the current Scene.
- Apply a Minor Condition to the target until the beginning of the adversary's next turn, and the target takes a Mark.
- Apply a Major Condition to the target until the beginning of the adversary's next turn.
- Cause Equipment Fallout to a target's equipped item.
<h4>Severe Interventions</h4>
- Apply a Minor Condition to the target Until Dispelled.
- Apply a Minor Condition to the target until the end of the current Scene, and the target takes 2 Marks.
- Apply a Major Condition to the target until the end of the current Scene.
- Apply a Major Condition to the target until the beginning of the adversary's next turn, and the target takes 3 Marks.

### Example Interventions

Sometimes you need to have some quick monsters in the back of your pocket when you find yourself in a Scene you hadn't prepared for. This is where **Adversary Archetypes** become useful. Each Adversary Archetype is associated with particular Potentials that the adversary excels in, making these archetypes narrower than [[archetypes|Character Archetypes]]. These excellence profiles will be referred to as their Potential Contour.
<h4>Breaker</h4>
The Breaker Archetype is for adversaries whose Potential Contour excels in Might.

> [!info]- Mechanical Intervention  
> **Ringing Blow.** The target has [[resolution-system|Disadvantage]] on their next **Brace** Test.

> [!important]- Minor Intervention  
> ***Crushing Opening.*** The target becomes [[conditions|Vulnerable]] (Might) until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Bone-Shaking Impact.*** The target becomes [[conditions|Held]] until the beginning of the adversary’s next turn and takes **1 Mark**.

> [!danger]- Severe Intervention  
> ***Pulverize.*** The target becomes [[conditions|Pinned]] until the beginning of the adversary’s next turn and takes **3 Marks**.
<h4>Prowler</h4>
The Prowler Archetype is for adversaries whose Potential Contour excels in Finesse.

> [!info]- Mechanical Intervention  
> ***Feint and Slip.*** The next attack made against the target has [[resolution-system|Advantage]].

> [!important]- Minor Intervention  
> ***Hamstring.*** The target becomes [[conditions|Vulnerable]] (Finesse) until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Shadow Bind.*** The target becomes [[conditions|Bound]] until the end of the current Scene.

> [!danger]- Severe Intervention  
> ***Ghosted Quarry.*** The adversary becomes [[conditions|Unseen]] against creatures **Until Dispelled**.
<h4>Survivor</h4>
The Survivor Archetype is for adversaries whose Potential Contour excels in Nerve.

> [!info]- Mechanical Intervention  
> ***Unyielding Pressure.*** The target has [[resolution-system|Disadvantage]] on their next Grit Test.

> [!important]- Minor Intervention  
> ***Attrition.*** Prevent the target’s Stress Track from overflowing; instead, move the overflow Stress to Nerve.

> [!warning]- Major Intervention  
> ***Wear Down.*** The target becomes [[conditions|Dazed]] until the beginning of the adversary’s next turn.

> [!danger]- Severe Intervention  
> ***Break Their Stamina.*** The target is [[conditions|Bleeding]] (Nerve) until the end of the current Scene.
<h4>Shifter</h4>
The Shifter Archetype is for adversaries whose Potential Contour excels in Seep.

> [!info]- Mechanical Intervention  
> ***Warped Reflex.*** The target has [[resolution-system|Disadvantage]] on their next Sleight Test.

> [!important]- Minor Intervention  
> ***Mutagenic Splash.*** The target becomes [[conditions|Muddled]] (Seep) until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Malformed Flesh.*** The target becomes Physically [[conditions|Vulnerable]] until the beginning of the adversary’s next turn.

> [!danger]- Severe Intervention  
> ***Transmuting Seizure.*** The target becomes [[conditions|Petrified]] until the beginning of the adversary’s next turn and takes **3 Marks**.
<h4>Hunter</h4>
The Hunter Archetype is for adversaries whose Potential Contour excels in Instinct.

> [!info]- Mechanical Intervention  
> ***Read the Motion.*** The next attack made against the target has [[resolution-system|Advantage]].

> [!important]- Minor Intervention  
> ***Cornered.*** The target gains [[conditions|Afraid]] until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Run to Ground.*** The target becomes [[conditions|Rooted]] (Here) until the end of the current Scene.

> [!danger]- Severe Intervention
> ***Prey Locked.*** The target becomes [[conditions|Slowed]] until the end of the current Scene.
<h4>Schemer</h4>
The Schemer Archetype is for adversaries whose Potential Contour excels in Wit.

> [!info]- Mechanical Intervention  
> ***Calculated Disruption.*** The target has [[resolution-system|Disadvantage]] on their next Sense Test.

> [!important]- Minor Intervention  
> ***False Step.*** The target becomes [[conditions|Muddled]] (Wit) until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Engineered Collapse.*** Cause [[equipment|Equipment Fallout]] to one equipped item of the target.

> [!danger]- Severe Intervention  
> ***System Shock.*** The target becomes [[conditions|Distracted]] until the end of the current Scene.
<h4>Zealot</h4>
The Zealot Archetype is for adversaries whose Potential Contour excels in Heart.

> [!info]- Mechanical Intervention  
> ***Overwhelming Presence.*** The target has [[resolution-system|Disadvantage]] on their next Hope Test.

> [!important]- Minor Intervention  
> ***Intimidating Cry.*** The target becomes [[conditions|Afraid]] until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Ruinous Conviction.*** The target becomes [[conditions|Enraptured]] by the adversary until the end of the current Scene.

> [!danger]- Severe Intervention  
> ***Spirit Break.*** The target becomes Mentally [[conditions|Vulnerable]] until the end of the current Scene.
<h4>Hexer</h4>
The Hexer Archetype is for adversaries whose Potential Contour excels in Tether.

> [!info]- Mechanical Intervention  
> ***Eldritch Static.*** The target has [[resolution-system|Disadvantage]] on their next Reason Test.

> [!important]- Minor Intervention  
> ***Whispered Blight.*** The target becomes [[conditions|Silenced]] until the beginning of the adversary’s next turn.

> [!warning]- Major Intervention  
> ***Soul Hook.*** The target becomes [[conditions|Dazed]] until the beginning of the adversary’s next turn.

> [!danger]- Severe Intervention  
> ***Malison.*** The target becomes [[conditions|Cursed]] until the end of the current Scene.

## Escalations

Adversaries are already formidable opponents through upscaling Fallout by taking dynamic action to apply Interventions, but any old adversary can find an opportunity during combat. It takes an elite form of adversary to adapt completely to a challenge mid-Scene. This is where Escalations come in.

Escalations are Surges available to adversaries that can be activated at any time, as long as it's not before a narrative event that has already been announced as happening. Just like Surges, Escalations cannot be activated more than once per turn. Generally, mundane adversaries do not have access to Escalations, but adversaries that could be considered unique, elite, or otherwise boss-level encounters may have access to Escalations. Escalations can be purchased using Difficulty points as follows:

| Escalation Level      | Difficulty Cost |
| --------------------- | --------------- |
| Mechanical Escalation | 2               |
| Minor Escalation      | 3               |
| Major Escalation      | 4               |
| Severe Escalation     | 5               |
### Escalation Templates

<h4>Mechanical Escalations</h4>
- Gain Advantage on the adversary’s next attack.
- Gain Advantage on the adversary’s next Test in a specific Skill.
- Gain a one-use temporary Reaction.
- Clear 1 Stress from a specific Potential.
<h4>Minor Escalations</h4>
- Gain a beneficial Minor Condition until the end of the adversary's next turn.
- Regain 1 spent Resistance in a specific Potential.
- Activate a D4 Sequence effect that grants one specific Reaction that creates an instantaneous effect of 1DV damage, a Minor Condition, Close movement, or Utility Narrative Weight.
<h4>Major Escalations</h4>
- Gain a beneficial Major Condition until the end of the adversary’s next turn.
- Gain a beneficial Minor Condition until the end of the current Scene.
- Gain a Trait effect that grants one specific Reaction that creates an instantaneous effect of 1DV damage, a Minor Condition, Close movement, or Utility Narrative Weight.
- Begin a DV Sequence effect that grants one specific Reaction that creates an instantaneous effect of XDV damage where X is the average character Tier, a Major Condition, Far movement, or Interpretable Narrative Weight.
<h4>Severe Escalations</h4>
- Gain a beneficial Major Condition until the end of the current Scene.
- Gain a Trait effect that grants one specific Reaction that creates an instantaneous effect of XDV damage where X is the average character Tier, a Major Condition, Far movement, or Interpretable Narrative Weight.

### Example Escalations

<h4>Breaker</h4>

> [!info]- Mechanical Escalation  
> ***Wind-Up.*** Gain [[resolution-system|Advantage]] on the adversary’s next attack.

> [!important]- Minor Escalation  
> ***Shoulder Through.*** Activate a D4 Sequence effect. The adversary gains the following Reaction until the Sequence expires: once per turn, when a creature impedes its movement or closes to challenge it, deal 1MDV of Nerve damage to that creature.

> [!warning]- Major Escalation  
> ***Punishing Mass.*** Gain [[conditions|Retaliate]] (Might/Nerve) until the end of the adversary’s next turn.

> [!danger]- Severe Escalation  
> ***Rampage.*** Become [[conditions|Frenzied]] until the end of the current Scene.

<h4>Prowler</h4>

> [!info]- Mechanical Escalation  
> ***Slip Aside.*** Gain a one-use temporary Reaction: after the adversary is targeted by an attack, it may immediately move Close.

> [!important]- Minor Escalation  
> ***Fade from Sight.*** Gain [[conditions|Unseen]] until the end of the adversary’s next turn.

> [!warning]- Major Escalation  
> ***Cut on the Turn.*** Gain a Trait effect until the end of the adversary’s next turn: once per round, when a creature misses the adversary, the adversary may apply [[conditions|Vulnerable]] (Finesse) to that creature, which lasts until the end of the adversary's next turn.

> [!danger]- Severe Escalation  
> ***Execution Window.*** Gain a Trait effect until the end of the current Scene: once per round, when the adversary attacks from hiding or from a superior position, it may also deal XFDV of Might damage to the target.

<h4>Survivor</h4>

> [!info]- Mechanical Escalation  
> ***Catch Breath.*** Clear 1 [[stress-and-fallout|Stress]] from Nerve.

> [!important]- Minor Escalation  
> ***Dig Deep.*** Regain 1 spent Nerve [[potentials-and-resistance|Resistance]].

> [!warning]- Major Escalation  
> ***Pain Answered.*** Gain [[conditions|Retaliate]] (Nerve/Finesse) until the end of the adversary’s next turn.

> [!danger]- Severe Escalation  
> ***Refuse to Fall.*** Become [[conditions|Warded]] (1) until the end of the current Scene.

<h4>Shifter</h4>

> [!info]- Mechanical Escalation  
> ***Reform.*** Gain [[resolution-system|Advantage]] on the adversary’s next Grace or Feat Test.

> [!important]- Minor Escalation  
> ***Mutable Hide.*** Become [[conditions|Armored]] by a Seep Shield until the end of the adversary’s next turn.

> [!warning]- Major Escalation  
> ***Slip the Shape.*** Gain a Trait effect until the end of the adversary’s next turn: once per round, when the adversary is targeted by an attack, it may immediately move Close to avoid the effect.

> [!danger]- Severe Escalation  
> ***Contagious Form.*** Gain a Trait effect until the end of the current Scene: once per round, when a creature makes direct contact with the adversary, that creature becomes Physically [[conditions|Vulnerable]] until the end of the adversary's next turn.

<h4>Hunter</h4>

> [!info]- Mechanical Escalation  
> ***Read the Trail.*** Gain [[resolution-system|Advantage]] on the adversary’s next Read or Sense Test.

> [!important]- Minor Escalation  
> ***Relentless Pursuit.*** Activate a D4 Sequence effect. The adversary gains the following Reaction until the Sequence expires: when a creature attempts to flee, hide, or widen the gap, the adversary may immediately move Close to keep pressure on it.

> [!warning]- Major Escalation  
> ***Predator’s Focus.*** Become [[conditions|Empowered]] (Instinct) until the end of the current Scene.

> [!danger]- Severe Escalation  
> ***Run Them Down.*** Gain a Trait effect until the end of the current Scene: once per round, when a creature attempts to escape the adversary’s pursuit, that creature becomes [[conditions|Slowed]] until the end of the adversary's next turn.

<h4>Schemer</h4>

> [!info]- Mechanical Escalation  
> ***Contingency.*** Gain [[resolution-system|Advantage]] on the adversary’s next Reason or Reflex Test.

> [!important]- Minor Escalation  
> ***Prepared Snag.*** Activate a D4 Sequence effect. The adversary gains the following Reaction until the Sequence expires: when a creature commits to an obvious course of action, the adversary becomes [[conditions|Empowered]] (Wit) to until the end of its next turn.

> [!warning]- Major Escalation  
> ***Cold Calculation.*** Become [[conditions|Fortified]] (1) until the end of the adversary’s next turn.

> [!danger]- Severe Escalation  
> ***Perfect Countermeasure.*** Gain a Trait effect until the end of the current Scene: once per round, when a creature activates an ability, manipulates a mechanism, or follows an anticipated plan, the adversary may move Close.

<h4>Zealot</h4>

> [!info]- Mechanical Escalation  
> ***Rallying Cry.*** Gain [[resolution-system|Advantage]] on the adversary’s or one of the adversary's allies' next Hope or Sway Test.

> [!important]- Minor Escalation  
> ***Fanatic Fervor.*** Become [[conditions|Empowered]] (Heart) until the end of the adversary’s next turn.

> [!warning]- Major Escalation  
> ***Rousing Presence.*** Become [[conditions|Spirited]] until the end of the adversary’s next turn.

> [!danger]- Severe Escalation  
> ***Break the Will.*** Gain a Trait effect until the end of the current Scene: once per round, when a creature fails a Test against the adversary, that creature becomes [[conditions|Distracted]] until the end of the adversary's next turn.
<h4>Breaker</h4>

> [!info]- Mechanical Escalation  
> ***Gather the Warp.*** Gain [[resolution-system|Advantage]] on the adversary’s next Weave or Grasp Test.

> [!important]- Minor Escalation  
> ***Dark Reserve.*** Regain 1 spent Tether [[potentials-and-resistance|Resistance]].

> [!warning]- Major Escalation  
> ***Occult Aegis.*** Become [[conditions|Fortified]] (1) until the end of the adversary’s next turn.

> [!danger]- Severe Escalation  
> ***Hexbound Reflex.*** Gain a Trait effect until the end of the current Scene: once per round, when a creature targets the adversary with a hostile effect or successfully resists one of its effects, that creature becomes [[conditions|Cursed]] until the end of the adversary's next turn.

