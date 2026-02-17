---
tags:
  - ttrpg
  - rules
aliases:
  - Tests
  - Success Levels
  - Miff
  - Crit
  - Resolution System
  - Hybrid Tests
  - Riskiness
  - Risky Tests
  - Advantage
  - Disadvantage
  - Contests
  - Rollies
  - Group Tests
---
# Resolution System
## A Deterministic D20 System

The Sunder TTRPG system uses a D20 system that allows players to know the outcome of their role without asking the GM for its "success level." 

All rolls in Sunder will fall under a **Test**. Tests are rolls made associated with a player's stats, or [[potentials-and-resistance|Potentials]]. Each creature has assigned scores for each of its 8 [[potentials-and-resistance|Potentials]]. Each [[potentials-and-resistance|Potential]] has three subcategories called **Skills**. When initiating a Test in one of these [[potentials-and-resistance|Skills]], a player must narrate and declare their goal for the outcome of this roll. 
### Initial Success Levels
###### *Potential and Resistance*

**Success levels** determine the narrative outcome of a given Test. Success levels range from the following values:

1. **Miff**\*\* <span>&mdash;</span> the worst plausible outcome
2. Failure* <span>&mdash;</span> a negative outcome according to the player's goal
3. Mixed* <span>&mdash;</span> an outcome with positive and negative (or overall neutral) results regarding the player's goal.
4. Success <span>&mdash;</span> a positive outcome according to the player's goal
5. **Crit** <span>&mdash;</span> the best plausible outcome

*\* Success levels with a caveat will involve some sort of cost related to the action taken. This can come in the form of physical retribution, [[equipment]] damage, mental repercussion, or narrative detriments (see [[stress-and-fallout|Fallout]]).*
*\*\* A critical failure, or Miff is the opposite of a Crit; it has the equivalent of two caveats or costs, but your GM may choose to narrate a single, more catastrophic consequence.*

Crits and Miffs will always be final and determine the outcome of the initial roll (unless otherwise stated). This means [[volatility-and-perks|Volatility]] cannot change the success level of a D20 that has rolled a Crit or Miff. Sunder uses a variant "Roll Under" system, so Crits occur when a player's [[potentials-and-resistance|Potential]] score value is rolled on the D20, and Miffs occur when a 20 is rolled on the D20.

A player will receive different base success levels based on the [[potentials-and-resistance|Potential]] they are rolling the Test under. [[potentials-and-resistance|Potentials]] are both representations of a creature's capabilities, as well as a resource to be managed. Spending resources from a [[potentials-and-resistance|Potential]] is called expending a **[[potentials-and-resistance|Resistance]]**, or Resistance Drain. [[potentials-and-resistance|Resistance]] points can be used to fuel ability features and can be restored through [[resting]] and healing.

Initial success levels are decided as follows:

$$
\text{Outcome}(x_{D20};P_{potential},R_{resistance})=
\begin{cases}
\textbf{Crit} & x\in\{P\},\\[2pt]
\textbf{Success} & x\in\bigl(R,\;P\bigr),\\[2pt]
\textbf{Mixed} & x\in\bigl[1,\;R\bigr],\\[2pt]
\textbf{Failure} & x\in\bigl(P,\;20\bigr),\\[2pt]
\textbf{Miff} & x\in\{20\}.
\end{cases}
$$

![[../assets/Sunder Resolution (Usability Variant).png]]

> [!warning]- The Rule of Narrative Ease
> During gameplay, there are many situations where taking action may not require a test of a character's ability, and can be resolved purely narratively. As long as the situation is low-risk, players shouldn't need to make a Test toll at all as long as they have the time to do it unhurriedly. Remember your heroes are capable! Be sure not to bog down the narrative flow with excessive Skill Tests, and allow players to tell the story they want to build.

==Note:== When a player's Test results in a success level of 3 or below (Mixed, Failure, Miff), they gain a Beat. 

### Emphasized Rolls
Crits and Miffs are major story beats that represent parts of the hero's journey. Rolling either of these success levels naturally on the D20 has additional mechanical effects defined below:
###### Rolling Natural Crits
Rolling a Natural Crit not only counts as an automatic best plausible outcome, but also allows a player to recover a [[potentials-and-resistance|Resistance]] point of their choosing.
###### Rolling Natural Miffs
Rolling a Natural Miff counts as an automatic worst plausible outcome, and causes an additional loss of a [[potentials-and-resistance|Resistance]] point in the [[potentials-and-resistance|Potential]] used in the triggering Test.

!!! nextup "See [[volatility-and-perks|Volatility]] for modifying Test success levels!"

### Additional Test Types

###### Hybrid Tests
If the GM believes testing a Skill in a certain Test should require a different [[potentials-and-resistance|Potential]] score, they may decide to call for a Hybrid Test. The GM may state this by declaring something similar to "make a Wit (Sleight) test." This is executed by rolling a Test under the declared [[potentials-and-resistance|Potential]] (Wit), but determining the [[volatility-and-perks|Volatility Pool]] based on [[proficiencies|proficiency]] in the declared Skill (Sleight)[^1]. 
###### Risky Tests
Rolls with significant difficulty may become risky. A normal test represents the first level of Riskiness. A Test threatens [[stress-and-fallout|Stress]] and even [[stress-and-fallout|Fallout]], so they should only be called for in somewhat risky situations.

Higher levels of riskiness will alter what is rolled in a player's [[volatility-and-perks|Volatility Pool]]:

| Level | Riskiness | Modifier to Volatility |
| ----- | --------- | ---------------------- |
| 0     | Uncertain | None, regular roll     |
| 1     | Risky     | -1 Volatility Die      |
| 2     | Dire      | -2 Volatility Dice     |
| 3     | Desperate | -3 Volatility Dice     |

If the modifier would ever cause the [[volatility-and-perks|Volatility Pool]] to be less than zero (-X), then roll X + 1 [[volatility-and-perks|Volatility Dice]], and take the lowest result instead of the highest.
###### Advantage/Disadvantage

If a Test is given Advantage, then it is rolled with -1 level of Riskiness (see above). If the Riskiness Level is lower than zero, a [[volatility-and-perks|Volatility Die]] is added to the pool instead. If a Test is given Disadvantage, then it is made with +1 level of Riskiness.
###### Contests
Rolls between players are not encouraged, as this is a game that supports the exploration of team relationships and mutual support. Instead, it is highly encouraged to resolve any inter-party conflict narratively. Be mindful of the story you want to tell in these situations, not just how your character feels.

In situations where this cannot be circumvented, the initiator of an action rolls a test in the center of the table. The target, to resist, may then roll a test of their own, also in the center of the table. If the dice collide and change their results, then the new results are kept to determine the effect. Be sure to use different-colored D20s and [[volatility-and-perks|Volatility Dice]] from your partner to discern between the two sets. The highest level of success succeeds; ties are resolved by the highest number rolled between the [[volatility-and-perks|Volatility]] Pools, or Rollies.

> [!note]+ Rollies
> When the result of a contested roll is insignificant, or the opposing efforts are tied, Rollies may be a good method of resolution. The two opposing players both roll a D20. Whoever rolls the lowest wins. In the case of tie, repeat the process.
###### Group Tests
Group Tests are when the entire party needs to make a shared roll. Each player rolls the called for Test and consults the success level. Each player's success level is represented by a number called the modifier:

<div style="display: flex; flex-direction: row; align-items: center; justify-content: space-around; width: 100%;">
	<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 15%;">
		<strong>-2</strong>
		<p>Miff</p>
	</div>
	<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 15%;">
		<strong>-1</strong>
		<p>Failure</p>
	</div>
	<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 15%;">
		<strong>0</strong>
		<p>Mixed</p>
	</div>
	<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 15%;">
		<strong>1</strong>
		<p>Success</p>
	</div>
	<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 15%;">
		<strong>2</strong>
		<p>Crit</p>
	</div>
</div>
After converting each player's success level to a modifier, add all results together to determine the overall level of success. Convert the sum back to a success level as if it were a modifier, treating outliers as Miffs or Crits.

[^1]: Other sources of [[volatility-and-perks|Volatility]] such as a Domain, [[proficiencies|Knacks]], and [[abilities]] are added as normal.