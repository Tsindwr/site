---
tags:
  - ttrpg
  - rules
---
# Resolution System
## A Deterministic D20 System

The Sunder TTRPG system uses a D20 system that allows players to know the outcome of their role without asking the GM for its "success level." 

All rolls in Sunder will fall under a **Test**. Tests are rolls made associated with a player's stats, or [[potentials|Potentials]]. Each creature has assigned scores for each of its 8 Potentials. Each Potential has three subcategories called **Skills**. When initiating a Test in one of these Skills, a player must narrate and declare their goal for the outcome of this roll. 

### Initial Success Levels
###### *Potential and Resistance*

**Success levels** determine the narrative outcome of a given Test. Success levels range from the following values:

1. **Miff**\*\* <span>&mdash;</span> the worst plausible outcome
2. Fail* <span>&mdash;</span> a negative outcome according to the player's goal
3. Mixed* <span>&mdash;</span> an outcome with positive and negative (or overall neutral) results regarding the player's goal.
4. ==Success==* <span>&mdash;</span> a positive outcome according to the player's goal. (This result is NOT a base success level. See [[volatility-and-perks|Volatility]].)
5. Success <span>&mdash;</span> a positive outcome according to the player's goal
6. **Crit** <span>&mdash;</span> the best plausible outcome

*\* Success levels with a caveat will involve some sort of cost related to the action taken. This can come in the form of physical retribution, equipment damage, mental repercussion, or narrative detriments (see [[stress-fallout-and-marks|Fallout]]).*
*\*\* A critical fail, or Miff is the opposite of a Crit; it has the equivalent of two caveats or costs, but your GM may choose to narrate a single, more catastrophic consequence.*

Crits and miffs will always be final and determine the outcome of the initial roll (unless otherwise stated). Sunder uses a variant "Roll Under" system, so Crits occur when a 1 is rolled on the D20, and Miffs occur when a 20 is rolled on the D20.

A player will receive different base success levels based on the Potential they are rolling the Test under. Potentials are both representations of a creature's capabilities, as well as a resource to be managed. Spending resources from a Potential is called expending a **Resistance**, or Resistance Drain. Resistance points can be used to fuel ability features and can be restored through resting and healing.

Initial success levels are decided as follows:

$$
\text{Outcome}(x_{D20};P_{potential},R_{resistance})=
\begin{cases}
\textbf{Crit} & x\in\{P\},\\[2pt]
\textbf{Success} & x\in\bigl(R,\;P\bigr),\\[2pt]
\textbf{Mixed} & x\in\bigl[1,\;R\bigr],\\[2pt]
\textbf{Fail} & x\in\bigl(P,\;20\bigr),\\[2pt]
\textbf{Miff} & x\in\{20\}.
\end{cases}
$$

![[../assets/Sunder Resolution (Usability Variant).png]]

==Note:== When a player's Test results in a success level of 3 or below (Mixed, Fail, Miff), they gain a Beat. 

### Modifying Success Levels
###### *Volatility*

The **Volatility Die** is a special modifier to a Test roll, but only applies under certain conditions. In order to add a Volatility Die or Volatility Dice to a Test, a player must satisfy one or more of the following scenarios:

- If a player has proficiency in the Skill associated with the Test, add a Volatility Die.
- If a player has Volatility in one or more Domains relevant to this Test, add a Volatility Die.
- If a player has a Knack associated with this Test, add a Volatility Die per relevant Knack.
- If a player otherwise has an ability allowing additional Volatility Dice to be added to the rolling pool, add those as well.

The role of Volatility in a roll is to modify the base success level of a Test. Volatility represents a creature's association or experience with a given activity, giving them an opportunity to turn a failure into a success, but also risking the chance of decreasing the success level. 

Like in Tests, the thresholds of Volatility Dice are impacted by an external feature: **Stress**. Stress represents the amount of strain a creature has accumulated from external influence and Fallout. Stress is more common than Resistance Drain, but is easier to reset and recover from.